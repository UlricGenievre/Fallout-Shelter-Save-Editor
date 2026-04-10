/** 
 * Checks if a dweller is a child.
 * In Fallout Shelter save files, children carry specific outfits (costumes)
 * and cannot be equipped with weapons or standard adult outfits.
 */
export function isChild(dweller: any): boolean {
  if (!dweller) return false;
  
  const outfitId = dweller.equipedOutfit?.id || '';
  // Children outfits in save files are typically named "costume_XX"
  return outfitId.toLowerCase().startsWith('costume_');
}
