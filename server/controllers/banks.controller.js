import { publicBanks, PRODUCT_TYPES } from '../data/banks.js';
export function getBanks() { return { products: PRODUCT_TYPES, banks: publicBanks() }; }
