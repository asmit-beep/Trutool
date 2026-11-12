// One-time signing key preservation. Never prints raw credentials. Preview branch only.
import {createCipheriv,hkdfSync,randomBytes} from 'node:crypto';
if(process.env.VERCEL_ENV!=='preview'||process.env.VERCEL_GIT_COMMIT_REF!=='migration/trutool-storage-consolidation-20261112'){
 console.log('Signing-seed export not enabled for this build');process.exit(0);
}
if(process.env.TRUTOOL_LEGACY_SIGNING_EXPORT!=='true')throw Error('One-time legacy signing export not authorized');
const seed=process.env.BLOB_READ_WRITE_TOKEN,master=process.env.ADMIN_SESSION_SECRET;
if(!seed||!master||seed.length<20||master.length<20)throw Error('Signing seed or master missing');
const key=Buffer.from(hkdfSync('sha256',Buffer.from(master),Buffer.from('trutool-signing-encryption-2026'),Buffer.from('legacy-blob-signature-seed-v1'),32));
const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
cipher.setAAD(Buffer.from('trutool-legacy-sign-v1'));
const ciphertext=Buffer.concat([cipher.update(seed,'utf8'),cipher.final()]);
const wrapped=Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64url');
if(wrapped.length<80)throw Error('Wrapped signing key unexpectedly short');
console.log('TRUTOOL_ENCRYPTED_SIGNING_SEED='+wrapped);
