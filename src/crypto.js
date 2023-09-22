import {encodeBytes, decodeBytes} from './utils.js'
import forge from 'node-forge';

const algo = 'AES-CBC'

const pack = buff =>
  window.btoa(String.fromCharCode.apply(null, new Uint8Array(buff)))

const unpack = packed => {
  const str = window.atob(packed)

  return new Uint8Array(str.length).map((_, i) => str.charCodeAt(i)).buffer
}

// export const genKey = async (secret, ns) =>
//   crypto.subtle.importKey(
//     'raw',
//     await crypto.subtle.digest(
//       {name: 'SHA-256'},
//       encodeBytes(`${secret}:${ns}`)
//     ),
//     {name: algo},
//     false,
//     ['encrypt', 'decrypt']
//   )

export const genKey = async (secret, ns) => {
  const key = forge.sha256.create().update(`${secret}:${ns}`).digest();
  return {
    chiper: forge.cipher.createCipher(algo, key.data),
    decipher: forge.cipher.createDecipher(algo, key.data),
  }
};

// const iv = crypto.getRandomValues(new Uint8Array(16));

const iv_to_str = (iv)=>{
  const p = [];
  for(let i=0; i<iv.length; i++){
    p.push(String.fromCharCode(iv[i]));
  }
  return p.join('');
};
export const encrypt = async (keyP, plaintext) => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const chiper = keyP.chiper;
  chiper.start({iv: iv_to_str(iv)});
  chiper.update(forge.util.createBuffer(plaintext));
  chiper.finish();
  console.log(66, chiper.output);
  const xx = forge.util.encode64(chiper.output.data);
  return JSON.stringify({
    c: xx,
    iv: [...iv]
  })
};

// export const encrypt = async (keyP, plaintext) => {
//   // const iv = crypto.getRandomValues(new Uint8Array(16))

//   return JSON.stringify({
//     c: pack(
//       await crypto.subtle.encrypt(
//         {name: algo, iv},
//         await keyP,
//         encodeBytes(plaintext)
//       )
//     ),
//     iv: [...iv]
//   })
// }

// export const decrypt = async (keyP, raw) => {
//   const {c, iv} = JSON.parse(raw)

//   return decodeBytes(
//     await crypto.subtle.decrypt(
//       {name: algo, iv: new Uint8Array(iv)},
//       await keyP,
//       unpack(c)
//     )
//   )
// }

export const decrypt = async (keyP, raw) => {
  const decipher = keyP.decipher;
  const {c, iv} = JSON.parse(raw);

  decipher.start({iv: iv_to_str(iv)});
  const xx = forge.util.decode64(c);
  decipher.update(forge.util.createBuffer().putBytes(xx));
  decipher.finish();

  return decipher.output.data;
}

// genKey('aaa', 'bbb').then(async (key)=>{
//   console.log(11111, key)
//   const ee = await encrypt(key, 'ccc');
//   console.log(2222, ee);
//   const dd = await decrypt(key, ee);
//   console.log(333, dd);
// })

// genKey1('aaa', 'bbb').then(async (key)=>{
//   console.log(4444, key)
//   const ee = await encrypt1(key, 'ccc');
//   console.log(5555, ee);
//   const dd = await decrypt1(key, ee);
//   console.log(6666, dd);
// })