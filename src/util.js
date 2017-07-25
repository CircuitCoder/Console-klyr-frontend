export function matchPinyin(input, pinyin, text) {
  let ptr = 0;
  for(let i = 0; i<pinyin.length; ++i) {
    if(input[ptr] === text[i])
      ++ptr;
    else if(pinyin[i] && input[ptr] === pinyin[i][0]) {
      let pinyinptr = 0;
      while(pinyinptr < pinyin[i].length
        && ptr < input.length
        && pinyin[i][pinyinptr] === input[ptr]) {
        ++pinyinptr;
        ++ptr;
      }
    } else return false;

    if(ptr === input.length) return true;
  }
}
