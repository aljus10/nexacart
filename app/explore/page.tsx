import type {Metadata} from 'next';
import CommerceWorkspace from '@/components/nexacart/workspace/CommerceWorkspace';
export const metadata:Metadata={title:'NexaCart · Analytics'};
export default function WorkspacePage(){return <CommerceWorkspace initialTab="analytics"/>;}
