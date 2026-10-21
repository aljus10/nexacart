-- NexaCart read-only integration. Run once in the Supabase SQL editor.
-- No existing tables or data are created, modified, or dropped by this script.
-- Both functions use dynamic relation references so dropping a dimension does
-- not cascade-drop the functions. Only service_role may call these endpoints.

create or replace function public.nexacart_snapshot()
returns jsonb language plpgsql stable security invoker
set search_path = pg_catalog, public
set statement_timeout = '8s'
as $$
declare
  names text[] := array['fact_order_items','dim_customer','dim_product','dim_seller','dim_payment','dim_shipping'];
  expected jsonb := '{"fact_order_items":["order_item_id","order_number","order_date","customer_id","product_id","seller_id","payment_id","shipping_id","quantity","unit_price","discount_amount","shipping_fee","gross_sales","net_sales","total_paid"],"dim_customer":["customer_id","customer_name","city"],"dim_product":["product_id","product_name","category","brand"],"dim_seller":["seller_id","shop_name","seller_city"],"dim_payment":["payment_id","payment_method"],"dim_shipping":["shipping_id","shipping_method","courier_name"]}';
  name text; cols text[]; selected text; n bigint; records jsonb; result jsonb := '{}'::jsonb;
begin
  foreach name in array names loop
    begin
      if to_regclass(format('public.%I', name)) is null then
        result := result || jsonb_build_object(name,jsonb_build_object('status','missing','columns','[]'::jsonb,'rows','[]'::jsonb,'total',0));
        continue;
      end if;
      select array_agg(e.col order by e.ord) into cols
      from jsonb_array_elements_text(expected->name) with ordinality e(col,ord)
      where exists(select 1 from pg_attribute a where a.attrelid=to_regclass(format('public.%I',name)) and a.attname=e.col and a.attnum>0 and not a.attisdropped);
      select string_agg(format('%I',c),',') into selected from unnest(cols) c;
      execute format('select count(*) from public.%I',name) into n;
      if selected is null then records := '[]'::jsonb;
      else
        execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) from (select %s from public.%I limit 15000) t',selected,name) into records;
      end if;
      result := result || jsonb_build_object(name,jsonb_build_object('status','available','columns',coalesce(to_jsonb(cols),'[]'::jsonb),'rows',records,'total',n,'truncated',n>15000));
    exception
      when undefined_table then result := result || jsonb_build_object(name,jsonb_build_object('status','missing','columns','[]'::jsonb,'rows','[]'::jsonb,'total',0));
      when others then result := result || jsonb_build_object(name,jsonb_build_object('status','error','columns','[]'::jsonb,'rows','[]'::jsonb,'total',0,'message','This table could not be read. Check its permissions and refresh.'));
    end;
  end loop;
  return jsonb_build_object('tables',result);
end;
$$;

create or replace function public.nexacart_query(query_plan jsonb)
returns jsonb language plpgsql stable security invoker
set search_path = pg_catalog, public
set statement_timeout = '5s'
as $$
declare
  metric text := query_plan->>'metric'; dim text := query_plan->>'dimension';
  direction text := coalesce(query_plan->>'direction','desc');
  lim int := coalesce((query_plan->>'limit')::int,10);
  filters jsonb := coalesce(query_plan->'filters','{}'::jsonb);
  aggregate_sql text; label_sql text := '''All commerce'''; group_sql text := '';
  where_sql text := ''; joins_sql text := ''; q text; records jsonb;
  dims jsonb := '{"seller":["dim_seller","s","seller_id","shop_name"],"category":["dim_product","p","product_id","category"],"product":["dim_product","p","product_id","product_name"],"brand":["dim_product","p","product_id","brand"],"city":["dim_customer","c","customer_id","city"],"payment":["dim_payment","pm","payment_id","payment_method"],"courier":["dim_shipping","sh","shipping_id","courier_name"],"shipping":["dim_shipping","sh","shipping_id","shipping_method"]}';
  used text[] := '{}'; key text; val text; spec jsonb; a text; expr text;
begin
  if jsonb_typeof(query_plan) <> 'object' or jsonb_typeof(filters) <> 'object' then raise exception 'Invalid query plan'; end if;
  if exists(select 1 from jsonb_object_keys(query_plan) k where k not in ('metric','dimension','limit','direction','filters','title')) then raise exception 'Unsupported property'; end if;
  if lim < 1 or lim > 100 or direction not in ('asc','desc') then raise exception 'Invalid result bounds'; end if;
  aggregate_sql := case metric
    when 'net_sales' then 'coalesce(sum(f.net_sales),0)'
    when 'orders' then 'count(distinct f.order_number)'
    when 'units' then 'coalesce(sum(f.quantity),0)'
    when 'aov' then 'sum(f.net_sales)/nullif(count(distinct f.order_number),0)'
    when 'items' then 'count(*)'
    when 'gross_sales' then 'coalesce(sum(f.gross_sales),0)'
    when 'discounts' then 'coalesce(sum(f.discount_amount),0)'
    when 'shipping_fees' then 'coalesce(sum(f.shipping_fee),0)'
    when 'total_paid' then 'coalesce(sum(f.total_paid),0)'
    else null end;
  if aggregate_sql is null or dim is null or (dim not in ('none','date') and not (dims ? dim)) then raise exception 'Unsupported measure or grouping'; end if;
  if dim = 'date' then label_sql := 'f.order_date::text'; group_sql := ' group by 1';
  elsif dim <> 'none' then
    spec := dims->dim; a := spec->>1;
    label_sql := format('coalesce(%I.%I::text,''Unmatched / null'')',a,spec->>3);
    joins_sql := format(' left join public.%I %I on %I.%I=f.%I',spec->>0,a,a,spec->>2,spec->>2);
    used := array_append(used,a); group_sql := ' group by 1';
  end if;
  for key,val in select * from jsonb_each_text(filters) loop
    if key not in ('from','to','category','seller','payment','city','courier') or val is null or length(val)>120 then raise exception 'Unsupported filter'; end if;
    if val = '' then continue; end if;
    if key in ('from','to') then
      if val !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date'; end if;
      perform val::date;
      expr := format('f.order_date %s %L::date',case when key='from' then '>=' else '<=' end,val);
    else
      spec := dims->key; a := spec->>1;
      if not a=any(used) then
        joins_sql := joins_sql || format(' left join public.%I %I on %I.%I=f.%I',spec->>0,a,a,spec->>2,spec->>2);
        used := array_append(used,a);
      end if;
      expr := format('%I.%I=%L',a,spec->>3,val);
    end if;
    where_sql := where_sql || case when where_sql='' then ' where ' else ' and ' end || expr;
  end loop;
  q := format('select %s as label,%s as value from public.fact_order_items f%s%s%s order by %s limit %s',label_sql,aggregate_sql,joins_sql,where_sql,group_sql,case when dim='date' then 'label asc' else 'value '||direction||' nulls last,label asc' end,lim);
  begin
    execute 'select coalesce(jsonb_agg(to_jsonb(r)),''[]''::jsonb) from ('||q||') r' into records;
    return jsonb_build_object('rows',records);
  exception
    when undefined_table then
      return jsonb_build_object('rows','[]'::jsonb,'error','One or more required tables are unavailable in the database.');
    when others then
      return jsonb_build_object('rows','[]'::jsonb,'error','The query could not be completed. Check database permissions and table health.');
  end;
end;
$$;
revoke all on function public.nexacart_snapshot() from public,anon,authenticated;
revoke all on function public.nexacart_query(jsonb) from public,anon,authenticated;
grant execute on function public.nexacart_snapshot() to service_role;
grant execute on function public.nexacart_query(jsonb) to service_role;
notify pgrst, 'reload schema';
