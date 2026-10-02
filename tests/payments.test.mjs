import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyPayment,issuePayment,notifyPaidOrder,validEdition} from '../netlify/lib/payments.mjs';
const data=(book='almoravides-research',amount='9.99')=>({id:'ORDER123456',status:'COMPLETED',payer:{email_address:'buyer@example.test',name:{given_name:'Test'}},purchase_units:[{custom_id:`${book}:ar`,invoice_id:'TEST-REFERENCE',payments:{captures:[{id:'CAPTURE123',status:'COMPLETED',amount:{value:amount,currency_code:'EUR'},create_time:'2026-10-02T09:00:00Z'}]}}]});
function stores(){const maps=new Map();return name=>{if(!maps.has(name))maps.set(name,new Map());const m=maps.get(name);return {get:async k=>structuredClone(m.get(k)||null),setJSON:async(k,v)=>m.set(k,structuredClone(v))}}}
test('server catalogue rejects unknown products, prototype properties and unsupported research languages',()=>{
 assert.equal(validEdition('algerie','ar'),false);assert.equal(validEdition('__proto__','ar'),false);assert.equal(validEdition('almoravides-research','fr'),false);assert.equal(validEdition('almoravides','fr'),true);
});
test('only exact, completed EUR payment with matching order is accepted',()=>{
 assert.equal(verifyPayment('ORDER123456',data()).amount,'9.99');
 for(const change of [d=>d.status='APPROVED',d=>d.id='OTHER',d=>d.purchase_units[0].payments.captures[0].amount.value='0.01',d=>d.purchase_units[0].payments.captures[0].amount.currency_code='USD',d=>d.purchase_units[0].payments.captures[0].status='PENDING',d=>d.purchase_units.push(d.purchase_units[0])]) {const d=data();change(d);assert.throws(()=>verifyPayment('ORDER123456',d));}
});
test('manual research saves order and notifies once without exposing buyer or generating a download',async()=>{
 process.env.RESEND_API_KEY='test';process.env.RESEND_FROM_EMAIL='test@example.test';let calls=0;const store=stores();const original=global.fetch;
 global.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.deepEqual(body.to,['oueledsanhaja@gmail.com']);assert.match(body.text,/buyer@example.test/);return Response.json({id:'mail-test'})};
 try{const result=await issuePayment('ORDER123456',data(),store);assert.equal(result.deliveryMode,'manual');assert.equal(result.order,undefined);assert.equal(result.downloadUrl,undefined);assert.equal(result.adminNotificationStatus,'sent');await issuePayment('ORDER123456',null,store);assert.equal(calls,1);assert.equal((await store('paypal-orders').get('order:ORDER123456')).status,'COMPLETED')}finally{global.fetch=original}
});
test('youth purchase also notifies; mail outage persists retry and preserves the download',async()=>{
 process.env.PAYPAL_CLIENT_SECRET='test-secret';const store=stores();const original=global.fetch;let fail=true;
 global.fetch=async()=>fail?new Response('temporary',{status:503}):Response.json({id:'mail-retry'});
 try{const first=await issuePayment('ORDER123456',data('idrissides','4.99'),store);assert.equal(first.adminNotificationStatus,'pending');assert.ok(first.downloadUrl);fail=false;const second=await issuePayment('ORDER123456',null,store);assert.equal(second.adminNotificationStatus,'sent');assert.equal(second.downloadUrl,first.downloadUrl)}finally{global.fetch=original}
});
