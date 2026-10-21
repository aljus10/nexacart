import type {Metadata} from 'next';
import EntryScreen from '@/components/nexacart/entry/EntryScreen';
export const metadata:Metadata={title:'NexaCart · Every order tells a story',description:'Explore the shops, journeys, and numbers behind NexaCart.'};
export default function Page(){return <EntryScreen/>;}
