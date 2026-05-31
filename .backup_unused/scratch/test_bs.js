const { ADToBS, BSToAD } = require('bikram-sambat-js');
const ad = '2024-04-28';
const bs = ADToBS(ad);
console.log('AD to BS:', bs);
console.log('BS to AD:', BSToAD(bs));
