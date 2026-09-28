export type TextSize = 'md' | 'lg' | 'xl';

export const TEXT_SIZE_STORAGE_KEY = 'oc-text-size';

/*
 * Inlined by the server page so a saved size applies before paint instead of
 * jumping the layout after hydration. Mirrors applyTextSize in the control.
 */
export const TEXT_SIZE_PRE_PAINT = `try{var s=localStorage.getItem('${TEXT_SIZE_STORAGE_KEY}');if(s==='lg'||s==='xl')document.documentElement.dataset.ocText=s;}catch(e){}`;
