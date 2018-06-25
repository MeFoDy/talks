registerLayout('aspect', class {
  static get inputProperties() { return ['--aspect-ratio'] }
  *intrinsicSizes() { /* not yet implemented */ }

  *layout(_, __, constraints, styleMap) {
    const aspectRatio = parseFloat(
        styleMap.get('--aspect-ratio'));

    const autoBlockSize =
        constraints.fixedInlineSize * aspectRatio;

    return {autoBlockSize};
  }
});
