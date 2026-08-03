import { describe, expect, it } from 'vitest';
import { shadeHexColor } from './circle-inner-text';

describe('shadeHexColor', () => {
  it('darkens each channel', () => {
    expect(shadeHexColor('#808080', -30)).toBe('#626262');
  });

  it('lightens each channel', () => {
    expect(shadeHexColor('#102030', 16)).toBe('#203040');
  });

  it('zero-pads channels that fall into a single hex digit', () => {
    // The naive `.toString(16)` implementation produced '#f0a0a' here, which is
    // not a valid colour and silently broke the label.
    expect(shadeHexColor('#0f1e2d', -10)).toBe('#051423');
  });

  it('clamps instead of wrapping past the channel bounds', () => {
    expect(shadeHexColor('#fefefe', 40)).toBe('#ffffff');
    expect(shadeHexColor('#010101', -40)).toBe('#000000');
  });

  it('expands three digit hex colours', () => {
    expect(shadeHexColor('#abc', 0)).toBe('#aabbcc');
  });

  it('leaves non-hex colours untouched', () => {
    expect(shadeHexColor('rgb(1, 2, 3)', -30)).toBe('rgb(1, 2, 3)');
    expect(shadeHexColor('rebeccapurple', -30)).toBe('rebeccapurple');
  });
});
