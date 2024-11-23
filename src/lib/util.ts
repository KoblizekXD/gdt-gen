import type { GDTEntryData } from "../components/GdtEntryGenerator.astro";

export function formDataToIf(formData: FormData): GDTEntryData {
  const isLongMode = formData.get('isLongMode') === 'on';
  const page = formData.get('usePaging') === 'on';
  const mode = formData.get('mode') as '16-bit selector' | '32-bit selector';
  return {
    limitLow: isLongMode ? 0xFFFF : parseInt(formData.get("limit") as string) & 0xFFFF,
    limitMid: isLongMode ? 0xF : (parseInt(formData.get("limit") as string) >> 16) & 0xF,
    baseLow: isLongMode ? 0x0 : parseInt(formData.get("limit") as string) & 0xFFFF,
    baseMid: isLongMode ? 0x0 : (parseInt(formData.get("base") as string) >> 16) & 0xFF,
    baseMidder: isLongMode ? 0x0 : (parseInt(formData.get("base") as string) >> 24) & 0xFF,
    baseHigh: isLongMode ? 0x0 : (parseInt(formData.get("base") as string) >> 56) & 0xFF,
    flags: (page ? 0b1000 : 0b0000) | (mode === '32-bit selector' ? 0b0100 : 0b0000) | (isLongMode ? 0b0010 : 0b0000) | 0b0001,
    access: 
    (formData.get('valid') === 'on' ? 0b10000000 : 0)
    | (parseInt(formData.get('ring') as string) << 5)
    | (formData.get('isNotTSS') === 'on' ? 0b00010000 : 0) 
    | (formData.get('isCode') === 'on' ? 0b00001000 : 0) 
    | (formData.get('conforming') === 'on' ? 0b00000100 : 0) 
    | (formData.get('isrwable') === 'on' ? 0b00000010 : 0) 
    | 0b00000000
  };
}

export function writeData(gdt: GDTEntryData): string {
  return `
  gdt_entry_t gdt_entry = (gdt_entry_t) {
      .limit_low = 0x${gdt.limitLow.toString(16)},
      .base_low = 0x${gdt.baseLow.toString(16)},
      .base_middle = 0x${gdt.baseMid.toString(16)},
      .access = 0b${gdt.access.toString(2)},
      .granularity = 0b${gdt.flags.toString(2)},
      .base_middle2 = 0x${gdt.baseMidder.toString(16)},
      .limit_high = 0x${gdt.limitMid.toString(16)},
      .base_high = 0x${gdt.baseHigh.toString(16)},
      .reserved = 0x0
  };
  `.trim();
}