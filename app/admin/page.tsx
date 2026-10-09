import { AdminWorkspace } from '@/components/admin-workspace';
import { authenticated } from '@/lib/admin-auth';
import './admin.css';
export const dynamic='force-dynamic';
export const metadata={title:{absolute:'TruTool Studio — Admin'},description:'Private TruTool editorial workspace.',robots:{index:false,follow:false,googleBot:{index:false,follow:false}},alternates:{canonical:null},openGraph:{title:'TruTool Studio',description:'Private editorial workspace.'}};
export default async function Page(){return <AdminWorkspace initiallyAuthenticated={await authenticated()}/>;}
