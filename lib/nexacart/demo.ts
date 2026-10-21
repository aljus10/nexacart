import catalog from './map-catalog.json';
import { TABLES, tableNames, type Snapshot, type Row } from './engine';
let cached: Snapshot | undefined;
export function createDemo(): Snapshot {
  if (cached) return cached;
  let seed = 251016;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const cities = ['Iloilo City','Manila','Cebu City','Davao City','Bacolod','Quezon City','Makati','Baguio'];
  const sellers: Row[] = catalog.sellers.map(s=>({...s}));
  const specs: [string,string,string,number][] = [
    ['Wireless Headphones','Electronics','Soundform',1490],['Mechanical Keyboard','Electronics','Keyworks',2290],['Portable Speaker','Electronics','Soundform',1190],['USB-C Hub','Electronics','Keyworks',890],
    ['Ceramic Coffee Set','Home & Living','Luna',680],['Desk Organizer','Home & Living','Luna',390],['Linen Cushion','Home & Living','Homestead',450],['Reading Lamp','Home & Living','Homestead',980],
    ['Everyday Tote','Fashion','Daily Edit',350],['Cotton Overshirt','Fashion','Daily Edit',790],['Canvas Sneakers','Fashion','Stride',1290],['Classic Cap','Fashion','Stride',290],
    ['Yoga Mat','Sports','Stride',690],['Insulated Bottle','Sports','Stride',590],['Resistance Bands','Sports','Move',350],['Training Shorts','Sports','Move',490],
    ['Daily Sunscreen','Beauty','Bloom',399],['Gentle Cleanser','Beauty','Bloom',299],['Hydrating Serum','Beauty','Basic',549],['Travel Care Kit','Beauty','Basic',650],
    ['Dotted Journal','Books','Paper Trail',240],['Design Handbook','Books','Paper Trail',890],['Weekly Planner','Books','Paper Trail',390],['Creative Workbook','Books','Paper Trail',320],
  ];
  const products: Row[] = specs.map(([product_name,category,brand],i)=>({product_id:i+1,product_name,category,brand}));
  const customers: Row[] = Array.from({length:180},(_,i)=>({customer_id:i+1,customer_name:`Sample Customer ${String(i+1).padStart(3,'0')}`,city:cities[i%cities.length]}));
  const payments: Row[] = ['GCash','Credit card','Cash on delivery','Maya','Bank transfer'].map((payment_method,i)=>({payment_id:i+1,payment_method}));
  const shipping: Row[] = catalog.shipping.map(s=>({...s}));
  const facts: Row[] = [];
  let order=0;
  while (facts.length < 10000) {
    order++;
    const day = Math.floor(Math.pow(rand(),0.79)*90);
    const order_date = new Date(Date.UTC(2026,6,21+day)).toISOString().slice(0,10);
    const customer_id = 1+Math.floor(rand()*customers.length);
    const payment_id = [1,1,1,2,2,3,3,4,5][Math.floor(rand()*9)];
    const shipping_id = 1+Math.floor(rand()*shipping.length);
    const lines = 1+Math.floor(rand()*3);
    for (let line=0;line<lines && facts.length<10000;line++) {
      const product_id = 1+Math.floor(Math.pow(rand(),1.3)*products.length);
      const unit_price = specs[product_id-1][3];
      const quantity = 1+Math.floor(rand()*3);
      const gross_sales=unit_price*quantity;
      const discount_amount=rand()>.7 ? Math.round(gross_sales*.1) : 0;
      const net_sales=gross_sales-discount_amount;
      const shipping_fee=line===0 ? 45+shipping_id*10 : 0;
      const preferred = [1,3,15,6,23,11,26,30][Math.floor((product_id-1)/3)%8];
      facts.push({order_item_id:facts.length+1,order_number:`NX-${String(order).padStart(5,'0')}`,order_date,customer_id,product_id,seller_id:rand()>.18?preferred:1+Math.floor(rand()*sellers.length),payment_id,shipping_id,quantity,unit_price,discount_amount,shipping_fee,gross_sales,net_sales,total_paid:net_sales+shipping_fee});
    }
  }
  const all = {fact_order_items:facts,dim_customer:customers,dim_product:products,dim_seller:sellers,dim_payment:payments,dim_shipping:shipping};
  const tables = Object.fromEntries(tableNames.map(t=>[t,{status:'available',columns:[...TABLES[t]],rows:all[t],total:all[t].length}])) as Snapshot['tables'];
  cached = {source:'demo',tables,fetchedAt:'2026-10-19T00:00:00Z',geminiConfigured:false};
  return cached;
}
