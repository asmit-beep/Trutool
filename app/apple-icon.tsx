import {ImageResponse} from 'next/og';
export const size={width:180,height:180};
export const contentType='image/png';
export default function Icon(){return new ImageResponse(<div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',borderRadius:36,background:'#142333',color:'#caee94',fontSize:116,fontWeight:700}}>T</div>,size)}
