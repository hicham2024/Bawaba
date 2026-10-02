import {getStore} from '@netlify/blobs';
import {notifyPaidOrder} from '../lib/payments.mjs';
export const config={schedule:'*/10 * * * *'};
export default async()=>{
  const store=getStore('payment-notifications',{consistency:'strong'});
  let count=0;
  for await(const page of store.list({prefix:'paid:',paginate:true})) {
    for(const blob of page.blobs) {
      const entry=await store.get(blob.key,{type:'json'});
      if(entry?.status==='pending') {await notifyPaidOrder(entry.order);if(++count>=50)return;}
    }
  }
};
