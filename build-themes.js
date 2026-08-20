/*
 * Crimson Red theme builder.
 *
 * Single source of truth for all four themes. Run `node build-themes.js`
 * to regenerate the JSON files in ./themes.
 *
 * Variants produced:
 *   - Crimson Red Light          (regular)
 *   - Crimson Red Light Italic   (italic)
 *   - Crimson Red Dark           (regular)
 *   - Crimson Red Dark Italic    (italic)
 *
 * Light and dark share ONE syntax catalog (src/token-colors.base.json).
 * Dark is derived from the light palette by role-based color substitution
 * (LIGHT_TO_DARK), so the two can never drift apart again.
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'themes');
const BASE_TOKENS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src', 'token-colors.base.json'), 'utf8')
);

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */

// The light theme uses exactly these 9 foreground roles. Dark maps each
// role to a legible equivalent on a #1e1e1e background.
const LIGHT_TO_DARK = {
  '#000000': '#dcdcdc', // default text / punctuation / operators
  '#cc0000': '#ff6b6b', // keyword / crimson accent
  '#527000': '#b3c96f', // string (olive)
  '#116200': '#8dd17a', // constant / numeric / green
  '#00627a': '#4ec9d4', // function / teal
  '#a16800': '#d7a860', // class / type (amber)
  '#7b7b7bab': '#7f7f7f', // comment (gray)
  '#f44747': '#f44747', // hard error red (shared)
  '#ffffff': '#ffffff' // invalid fg placeholder (overridden below)
};

const ACCENT = '#cc0000'; // crimson, shared UI accent in both themes

// Light mode "desk": recent VS Code rounds the editor group's corners, so a
// slightly-grey chrome behind the white editor reads as a floating card
// (the built-in Light Modern approach). Editor + active tab stay white.
const LIGHT_CHROME = '#ececec';

/* ------------------------------------------------------------------ *
 * Syntax overrides (applied to BOTH regular + italic, after the base
 * catalog so they win). Written in LIGHT hex; transformed for dark.
 * ------------------------------------------------------------------ */

const SYNTAX_OVERRIDES = [
  // --- JSON: keys distinct from string values ---
  {
    name: 'JSON property name (key)',
    scope: 'support.type.property-name.json',
    settings: { foreground: '#00627a' }
  },
  {
    name: 'JSON property name punctuation',
    scope: 'support.type.property-name.json punctuation',
    settings: { foreground: '#00627a' }
  },
  {
    name: 'JSON5 / JSONC key',
    scope: 'support.type.property-name.json5, meta.structure.dictionary.key.json string.quoted',
    settings: { foreground: '#00627a' }
  },

  // --- XML / HTML: red tags, amber attributes, dim brackets, teal namespace ---
  {
    name: 'XML/HTML tag name',
    scope:
      'entity.name.tag, entity.name.tag.xml, entity.name.tag.localname.xml, entity.name.tag.html',
    settings: { foreground: '#cc0000' }
  },
  {
    name: 'XML/HTML tag punctuation (angle brackets)',
    scope:
      'punctuation.definition.tag, punctuation.definition.tag.xml, punctuation.definition.tag.begin.xml, punctuation.definition.tag.end.xml, punctuation.definition.tag.begin.html, punctuation.definition.tag.end.html',
    settings: { foreground: '#7b7b7bab' }
  },
  {
    name: 'XML/HTML attribute name',
    scope:
      'entity.other.attribute-name.xml, entity.other.attribute-name.localname.xml, entity.other.attribute-name.html',
    settings: { foreground: '#a16800' }
  },
  {
    name: 'XML namespace / prolog / doctype',
    scope:
      'entity.name.tag.namespace.xml, entity.other.attribute-name.namespace.xml, meta.tag.preprocessor.xml entity.name.tag, keyword.other.doctype, meta.tag.sgml.doctype',
    settings: { foreground: '#00627a' }
  },
  {
    name: 'XML attribute values (strings)',
    scope: 'string.quoted.double.xml, string.quoted.single.xml',
    settings: { foreground: '#527000' }
  },
  {
    name: 'XML CDATA',
    scope: 'string.unquoted.cdata.xml, constant.other.entity.xml',
    settings: { foreground: '#a16800' }
  },

  // --- Invalid: was #ffffff (invisible on white). Make it visible. ---
  {
    name: 'Invalid',
    scope:
      'invalid, invalid.illegal, invalid.broken, invalid.deprecated, invalid.unimplemented',
    settings: { foreground: '#cc0000', fontStyle: 'underline' }
  }
];

/* ------------------------------------------------------------------ *
 * Italic scopes (added only to the *Italic* variants; fontStyle-only,
 * so foreground colors are untouched).
 * ------------------------------------------------------------------ */

const ITALIC_RULES = [
  // Comments
  { scope: 'comment, punctuation.definition.comment', settings: { fontStyle: 'italic' } },
  {
    scope: 'comment.line, comment.block, comment.block.documentation',
    settings: { fontStyle: 'italic' }
  },
  // Control-flow keywords
  { scope: 'keyword.control', settings: { fontStyle: 'italic' } },
  {
    scope: 'keyword.control.import.python, keyword.control.flow.python',
    settings: { fontStyle: 'italic' }
  },
  // Storage keywords / modifiers (const, let, static, public, async, ...)
  {
    scope: 'storage, storage.type, storage.modifier',
    settings: { fontStyle: 'italic' }
  },
  // Types, classes, interfaces
  {
    scope:
      'entity.name.type, entity.name.type.class, entity.other.inherited-class, support.class, support.type.primitive, support.type.builtin',
    settings: { fontStyle: 'italic' }
  },
  // Language variables (this / self / super)
  {
    scope: 'variable.language, variable.language.super, variable.language.this',
    settings: { fontStyle: 'italic' }
  },
  // Parameters
  { scope: 'variable.parameter, variable.parameter.function', settings: { fontStyle: 'italic' } },
  // Markup / JSX attributes
  { scope: 'markup.italic, markup.italic.markdown', settings: { fontStyle: 'italic' } },
  {
    scope:
      'entity.other.attribute-name.js, entity.other.attribute-name.ts, entity.other.attribute-name.jsx, entity.other.attribute-name.tsx',
    settings: { fontStyle: 'italic' }
  }
];

/* ------------------------------------------------------------------ *
 * Semantic tokens
 * ------------------------------------------------------------------ */

const SEMANTIC_LIGHT = {
  enumMember: { foreground: '#000000' },
  'variable.constant': { foreground: '#116200' },
  'variable.defaultLibrary': { foreground: '#a16800' },
  'variable.readonly': { foreground: '#116200' },
  parameter: { foreground: '#000000' },
  property: { foreground: '#000000' },
  'property.readonly': { foreground: '#116200' },
  class: { foreground: '#a16800' },
  interface: { foreground: '#a16800' },
  enum: { foreground: '#a16800' },
  type: { foreground: '#a16800' },
  namespace: { foreground: '#a16800' },
  function: { foreground: '#00627a' },
  method: { foreground: '#00627a' },
  macro: { foreground: '#cc0000' }
};

/* ------------------------------------------------------------------ *
 * Workbench colors
 * ------------------------------------------------------------------ */

const LIGHT_COLORS = {
  foreground: '#616161',
  focusBorder: '#d1d1d1',
  'selection.background': '#fddd7e',
  'scrollbar.shadow': '#dddddd',
  'widget.border': '#e0e0e0',

  // Activity bar
  'activityBar.foreground': '#323232',
  'activityBar.background': '#ffffff',
  'activityBar.inactiveForeground': '#00000066',
  'activityBarBadge.foreground': '#ffffff',
  'activityBarBadge.background': ACCENT,
  'activityBar.border': '#e5e5e5',
  'activityBar.activeBackground': '#ffffff',
  'activityBar.activeBorder': ACCENT,

  // Side bar
  'sideBar.background': '#ffffff',
  'sideBar.foreground': '#343434',
  'sideBarSectionHeader.background': '#00000000',
  'sideBarSectionHeader.foreground': '#3f3f3f',
  'sideBarSectionHeader.border': '#00000010',
  'sideBarTitle.foreground': '#000000',
  'sideBar.border': '#e5e5e5',

  // Lists (distinct focus / active / inactive / hover states)
  'list.hoverBackground': '#f2f2f2',
  'list.hoverForeground': '#616161',
  'list.inactiveSelectionBackground': '#eaeaea',
  'list.inactiveSelectionForeground': '#616161',
  'list.activeSelectionBackground': '#ffdada',
  'list.activeSelectionForeground': '#cc0000',
  'list.focusBackground': '#ffdada',
  'list.focusForeground': '#cc0000',
  'list.focusOutline': '#cc000060',
  'list.highlightForeground': ACCENT,
  'list.dropBackground': '#fde4e4',
  'tree.indentGuidesStroke': '#a9a9a9',
  'listFilterWidget.background': '#efc1ad',
  'listFilterWidget.outline': '#00000000',
  'listFilterWidget.noMatchesOutline': '#be1100',

  // Status bar (visible border, was invisible)
  'statusBar.foreground': '#000000',
  'statusBar.background': LIGHT_CHROME,
  'statusBar.border': '#e5e5e5',
  'statusBarItem.hoverBackground': '#00000010',
  'statusBar.debuggingBackground': '#cc0000',
  'statusBar.debuggingForeground': '#ffffff',
  'statusBar.noFolderBackground': '#8a0000',
  'statusBar.noFolderForeground': '#ffffff',
  'statusBarItem.remoteBackground': '#990000',
  'statusBarItem.remoteForeground': '#ffffff',
  'statusBarItem.errorBackground': '#cc0000',
  'statusBarItem.errorForeground': '#ffffff',
  'statusBarItem.prominentBackground': '#cc000020',

  // Title bar
  'titleBar.activeBackground': LIGHT_CHROME,
  'titleBar.activeForeground': '#000000',
  'titleBar.inactiveBackground': LIGHT_CHROME,
  'titleBar.inactiveForeground': '#33333399',
  'titleBar.border': '#e5e5e5',

  // Command center
  'commandCenter.foreground': '#3f3f3f',
  'commandCenter.background': '#ffffff',
  'commandCenter.border': '#cc000030',
  'commandCenter.activeBackground': '#ececec',
  'commandCenter.activeBorder': '#cc000060',

  // Menus
  'menubar.selectionForeground': '#333333',
  'menubar.selectionBackground': '#0000001a',
  'menu.foreground': '#1b1b1b',
  'menu.background': '#ffffff',
  'menu.selectionForeground': '#ffffff',
  'menu.selectionBackground': ACCENT,
  'menu.selectionBorder': '#00000000',
  'menu.separatorBackground': '#c4c4c4',
  'menu.border': '#d4d4d4',

  // Buttons
  'button.background': ACCENT,
  'button.foreground': '#ffffff',
  'button.hoverBackground': '#ff3d3d',
  'button.secondaryForeground': '#ffffff',
  'button.secondaryBackground': '#5f6a79',
  'button.secondaryHoverBackground': '#4c5561',
  'button.border': '#00000000',

  // Inputs
  'input.background': '#ffffff',
  'input.border': '#cccccc',
  'input.foreground': '#686868',
  'inputOption.activeBackground': '#f0000033',
  'inputOption.activeBorder': '#cc000060',
  'inputOption.activeForeground': '#000000',
  'input.placeholderForeground': '#767676',
  'inputValidation.errorBackground': '#f2dede',
  'inputValidation.errorBorder': '#be1100',
  'inputValidation.infoBackground': '#e6f1fb',
  'inputValidation.infoBorder': '#75beff',
  'inputValidation.warningBackground': '#fdf8e6',
  'inputValidation.warningBorder': '#e9a700',
  'textLink.foreground': ACCENT,
  'textLink.activeForeground': '#a30000',

  // Badges
  'badge.background': ACCENT,
  'badge.foreground': '#ffffff',

  // Editor core
  'editor.background': '#ffffff',
  'editor.foreground': '#000000',
  'editorLineNumber.foreground': '#237893',
  'editorLineNumber.activeForeground': '#cc0000',
  'editorCursor.foreground': '#000000',
  'editorCursor.background': '#ffffff',
  'editor.selectionBackground': '#fddd7e',
  'editor.selectionForeground': '#000000',
  'editor.inactiveSelectionBackground': '#fdedb4',
  'editor.selectionHighlightBackground': '#fff2adbd',
  'editor.selectionHighlightBorder': '#00000000',
  'editor.wordHighlightBackground': '#57575726',
  'editor.wordHighlightStrongBackground': '#0e639c26',
  'editor.findMatchBackground': '#ffb85c',
  'editor.findMatchBorder': '#cc6a00',
  'editor.findMatchHighlightBackground': '#ea5c0055',
  'editor.findMatchHighlightBorder': '#00000000',
  'editor.findRangeHighlightBackground': '#b4b4b44d',
  'editor.rangeHighlightBackground': '#fdff0033',
  'editor.hoverHighlightBackground': '#add6ff26',
  'editor.lineHighlightBackground': '#fdf3f3',
  'editor.lineHighlightBorder': '#00000000',
  'editorWhitespace.foreground': '#33333328',
  'editorLink.activeForeground': '#0000ff',
  'editorIndentGuide.background': '#d3d3d3',
  'editorIndentGuide.activeBackground': '#cc000066',
  'editorRuler.foreground': '#d3d3d3',
  'editorBracketMatch.background': '#cc00001a',
  'editorBracketMatch.border': '#cc000080',
  'editor.foldBackground': '#fddd7e33',
  'editorGutter.background': '#ffffff',
  'editorGutter.modifiedBackground': '#66afe0',
  'editorGutter.addedBackground': '#81b88b',
  'editorGutter.deletedBackground': '#ca4b51',
  'editorGutter.foldingControlForeground': '#424242',
  'editorGutter.commentRangeForeground': '#424242',
  'editorCodeLens.foreground': '#999999',
  'editorGroup.border': '#e7e7e7',
  'editorGroupHeader.tabsBackground': '#ffffff',
  'editorGroupHeader.tabsBorder': '#e5e5e5',
  'editorGroupHeader.noTabsBackground': '#ffffff',
  'editorGroup.emptyBackground': LIGHT_CHROME,

  // Bracket pair colorization
  'editorBracketHighlight.foreground1': '#cc0000',
  'editorBracketHighlight.foreground2': '#00627a',
  'editorBracketHighlight.foreground3': '#a16800',
  'editorBracketHighlight.foreground4': '#116200',
  'editorBracketHighlight.foreground5': '#8a3ffc',
  'editorBracketHighlight.foreground6': '#527000',
  'editorBracketHighlight.unexpectedBracket.foreground': '#f44747',

  // Inlay hints, ghost text, sticky scroll
  'editorInlayHint.foreground': '#767676',
  'editorInlayHint.background': '#00000010',
  'editorInlayHint.typeForeground': '#767676',
  'editorInlayHint.parameterForeground': '#767676',
  'editorGhostText.foreground': '#a0a0a0',
  'editorStickyScroll.background': '#ffffff',
  'editorStickyScrollHover.background': '#f2f2f2',

  // Overview ruler
  'editorOverviewRuler.background': '#ffffff00',
  'editorOverviewRuler.border': '#7f7f7f4d',
  'editorOverviewRuler.findMatchForeground': '#d18616',
  'editorOverviewRuler.errorForeground': '#e51400',
  'editorOverviewRuler.warningForeground': '#e9a700',
  'editorOverviewRuler.infoForeground': '#75beff',
  'editorOverviewRuler.modifiedForeground': '#66afe0',
  'editorOverviewRuler.addedForeground': '#81b88b',
  'editorOverviewRuler.deletedForeground': '#ca4b51',

  // Problems
  'editorError.foreground': '#e51400',
  'editorWarning.foreground': '#e9a700',
  'editorInfo.foreground': '#75beff',
  'editorHint.foreground': '#6c6c6c',
  'problemsErrorIcon.foreground': '#e51400',
  'problemsWarningIcon.foreground': '#e9a700',
  'problemsInfoIcon.foreground': '#75beff',

  // Diff
  'diffEditor.insertedTextBackground': '#9bb95533',
  'diffEditor.removedTextBackground': '#ff000022',
  'diffEditor.insertedLineBackground': '#9bb9551f',
  'diffEditor.removedLineBackground': '#ff000012',
  'diffEditor.border': '#e7e7e7',

  // Panels / terminal
  'panel.background': '#ffffff',
  'panel.border': '#e5e5e5',
  'panelTitle.activeBorder': ACCENT,
  'panelTitle.activeForeground': '#424242',
  'panelTitle.inactiveForeground': '#424242bf',
  'terminal.foreground': '#333333',
  'terminal.selectionBackground': '#fddd7e88',
  'terminalCursor.background': '#ffffff',
  'terminalCursor.foreground': '#000000',
  'terminal.border': '#80808059',
  'terminal.ansiBlack': '#000000',
  'terminal.ansiBlue': '#0451a5',
  'terminal.ansiBrightBlack': '#666666',
  'terminal.ansiBrightBlue': '#0451a5',
  'terminal.ansiBrightCyan': '#0598bc',
  'terminal.ansiBrightGreen': '#14ce14',
  'terminal.ansiBrightMagenta': '#bc05bc',
  'terminal.ansiBrightRed': '#cc0000',
  'terminal.ansiBrightWhite': '#a5a5a5',
  'terminal.ansiBrightYellow': '#b5ba00',
  'terminal.ansiCyan': '#0598bc',
  'terminal.ansiGreen': '#00bc00',
  'terminal.ansiMagenta': '#bc05bc',
  'terminal.ansiRed': '#cd3131',
  'terminal.ansiWhite': '#555555',
  'terminal.ansiYellow': '#949800',

  // Breadcrumbs
  'breadcrumb.background': '#ffffff',
  'breadcrumb.foreground': '#616161cc',
  'breadcrumb.focusForeground': '#4e4e4e',
  'breadcrumb.activeSelectionForeground': '#cc0000',
  'breadcrumbPicker.background': '#ffffff',

  // Tabs
  'tab.activeForeground': '#333333',
  'tab.border': '#e5e5e5',
  'tab.activeBackground': '#ffffff',
  'tab.activeBorder': ACCENT,
  'tab.activeBorderTop': '#00000000',
  'tab.inactiveBackground': '#ffffff',
  'tab.inactiveForeground': '#333333b3',
  'tab.hoverBackground': '#ffffff',
  'tab.hoverForeground': '#333333',
  'tab.unfocusedActiveBorder': '#cc000080',
  'tab.lastPinnedBorder': '#cc000030',

  // Scrollbar
  'scrollbarSlider.background': '#64646466',
  'scrollbarSlider.hoverBackground': '#646464b3',
  'scrollbarSlider.activeBackground': '#00000099',

  // Progress
  'progressBar.background': ACCENT,
  'widget.shadow': '#00000029',

  // Editor widgets
  'editorWidget.foreground': '#494949',
  'editorWidget.background': '#ffffff',
  'editorWidget.border': '#cc000030',
  'editorWidget.resizeBorder': '#c7c7c7',
  'editorSuggestWidget.background': '#f5f5f5',
  'editorSuggestWidget.border': '#cc000030',
  'editorSuggestWidget.foreground': '#000000',
  'editorSuggestWidget.highlightForeground': '#cc0000',
  'editorSuggestWidget.focusHighlightForeground': '#cc0000',
  'editorSuggestWidget.selectedBackground': '#ffdada',
  'editorSuggestWidget.selectedForeground': '#000000',
  'editorHoverWidget.foreground': '#616161',
  'editorHoverWidget.background': '#f3f3f3',
  'editorHoverWidget.border': '#cc000030',
  'pickerGroup.border': '#cccedb',
  'pickerGroup.foreground': '#cc0000',
  'quickInput.background': '#ffffff',
  'quickInput.foreground': '#616161',
  'quickInputList.focusBackground': '#ffdada',
  'quickInputList.focusForeground': '#cc0000',

  // Debug
  'debugToolBar.background': '#f3f3f3',
  'debugToolBar.border': '#d5d5d5',
  'debugExceptionWidget.background': '#f3f3f3',
  'debugExceptionWidget.border': '#d5d5d5',
  'editorGutter.commentGlyphForeground': '#424242',

  // Notifications
  'notifications.foreground': '#474747',
  'notifications.background': '#f3f3f3',
  'notifications.border': '#e5e5e5',
  'notificationToast.border': '#e5e5e5',
  'notificationsErrorIcon.foreground': '#de1300',
  'notificationsWarningIcon.foreground': '#e9a700',
  'notificationsInfoIcon.foreground': '#75a4ff',
  'notificationCenter.border': '#e5e5e5',
  'notificationCenterHeader.foreground': '#616161',
  'notificationCenterHeader.background': '#e7e7e7',

  // Git decoration
  'gitDecoration.addedResourceForeground': '#587c0c',
  'gitDecoration.conflictingResourceForeground': '#6c6cc4',
  'gitDecoration.deletedResourceForeground': '#ad0707',
  'gitDecoration.ignoredResourceForeground': '#8e8e90',
  'gitDecoration.modifiedResourceForeground': '#895503',
  'gitDecoration.stageDeletedResourceForeground': '#ad0707',
  'gitDecoration.stageModifiedResourceForeground': '#895503',
  'gitDecoration.submoduleResourceForeground': '#1258a7',
  'gitDecoration.untrackedResourceForeground': '#007100',

  // Peek view
  'peekView.border': '#cc000060',
  'peekViewEditor.background': '#fffbfb',
  'peekViewEditorGutter.background': '#fffbfb',
  'peekViewEditor.matchHighlightBackground': '#f5d802de',
  'peekViewResult.background': '#ffffff',
  'peekViewResult.fileForeground': '#1e1e1e',
  'peekViewResult.lineForeground': '#646465',
  'peekViewResult.matchHighlightBackground': '#ea5c0032',
  'peekViewResult.selectionBackground': '#ffdada',
  'peekViewResult.selectionForeground': '#6c6c6c',
  'peekViewTitle.background': '#ffffff',
  'peekViewTitleDescription.foreground': '#616161e6',
  'peekViewTitleLabel.foreground': '#333333',

  // Icons / form controls
  'icon.foreground': '#616161',
  'checkbox.background': '#ffffff',
  'checkbox.foreground': '#686868',
  'checkbox.border': '#cccccc',
  'dropdown.background': '#ffffff',
  'dropdown.foreground': '#686868',
  'dropdown.border': '#cccccc',
  'keybindingLabel.background': '#00000010',
  'keybindingLabel.foreground': '#555555',
  'keybindingLabel.border': '#00000020',
  'keybindingLabel.bottomBorder': '#00000020',

  // Minimap
  'minimapGutter.addedBackground': '#81b88b',
  'minimapGutter.modifiedBackground': '#66afe0',
  'minimapGutter.deletedBackground': '#ca4b51',
  'minimap.findMatchHighlight': '#d18616',
  'minimap.selectionHighlight': '#fddd7e',
  'minimap.errorHighlight': '#e51400',
  'minimap.warningHighlight': '#e9a700',
  'minimap.background': '#ffffff',

  // Merge conflicts
  'merge.currentHeaderBackground': '#a4e3d6',
  'merge.currentContentBackground': '#dbf4ef',
  'merge.incomingHeaderBackground': '#a6cfff',
  'merge.incomingContentBackground': '#dbecff',
  'merge.commonHeaderBackground': '#bfbfbf',
  'merge.commonContentBackground': '#e5e5e5',

  // Settings / misc
  'settings.headerForeground': '#616161',
  'settings.modifiedItemIndicator': '#cc0000',
  'settings.focusedRowBackground': '#00000007',
  'sideBar.dropBackground': '#fde4e4',
  'panelSection.border': '#80808059',
  'walkThrough.embeddedEditorBackground': '#f4f4f4',

  // Testing
  'testing.iconPassed': '#00bc00',
  'testing.iconFailed': '#e51400',
  'testing.iconErrored': '#e51400',
  'testing.iconSkipped': '#848484',

  // Charts
  'charts.red': '#cc0000',
  'charts.blue': '#00627a',
  'charts.yellow': '#a16800',
  'charts.green': '#116200',
  'charts.orange': '#cc6a00',
  'charts.purple': '#8a3ffc',
  'charts.foreground': '#616161',
  'charts.lines': '#61616180'
};

// Dark uses a graduated elevation ladder so panels read as distinct tiers:
// editor deepest, side bars up a step, activity bar higher, frame lightest
// (Option A: subtle ~5-step gaps). Selection keeps the gold tint.
const DARK_EDITOR = '#1a1a1a'; // darkest — editor + its card (tabs, gutter, minimap, breadcrumb, sticky scroll)
const DARK_SURFACE = '#1f1f1f'; // primary/secondary side bar, bottom panel, terminal, inactive tabs
const DARK_ACTIVITY = '#242424'; // activity bar
const DARK_FRAME = '#2a2a2a'; // title bar, status bar, empty-editor void
const DARK_ELEVATED = '#303030'; // floating widgets (suggest, hover, menu, quick input, notifications)
const DARK_SEAM = '#2e2e2e'; // neutral borders between panels
const DARK_BG = DARK_EDITOR; // editor background, referenced widely below
const DARK_COLORS = {
  foreground: '#cccccc',
  focusBorder: '#5a5a5a',
  'selection.background': '#4d3c14',
  'scrollbar.shadow': '#000000',
  'widget.border': '#303030',

  // Activity bar
  'activityBar.foreground': '#e0e0e0',
  'activityBar.background': DARK_ACTIVITY,
  'activityBar.inactiveForeground': '#ffffff66',
  'activityBarBadge.foreground': '#ffffff',
  'activityBarBadge.background': ACCENT,
  'activityBar.border': DARK_SEAM,
  'activityBar.activeBackground': DARK_ACTIVITY,
  'activityBar.activeBorder': '#ff6b6b',

  // Side bar
  'sideBar.background': DARK_SURFACE,
  'sideBar.foreground': '#c8c8c8',
  'sideBarSectionHeader.background': '#00000000',
  'sideBarSectionHeader.foreground': '#c8c8c8',
  'sideBarSectionHeader.border': '#ffffff10',
  'sideBarTitle.foreground': '#e0e0e0',
  'sideBar.border': DARK_SEAM,

  // Lists
  'list.hoverBackground': '#232323',
  'list.hoverForeground': '#cccccc',
  'list.inactiveSelectionBackground': '#252525',
  'list.inactiveSelectionForeground': '#cccccc',
  'list.activeSelectionBackground': '#3a1f1f',
  'list.activeSelectionForeground': '#ff8f8f',
  'list.focusBackground': '#3a1f1f',
  'list.focusForeground': '#ff8f8f',
  'list.focusOutline': '#cc000080',
  'list.highlightForeground': '#ff6b6b',
  'list.dropBackground': '#3a1f1f',
  'tree.indentGuidesStroke': '#585858',
  'listFilterWidget.background': '#4a2222',
  'listFilterWidget.outline': '#00000000',
  'listFilterWidget.noMatchesOutline': '#be1100',

  // Status bar
  'statusBar.foreground': '#d0d0d0',
  'statusBar.background': DARK_FRAME,
  'statusBar.border': DARK_SEAM,
  'statusBarItem.hoverBackground': '#ffffff12',
  'statusBar.debuggingBackground': '#cc0000',
  'statusBar.debuggingForeground': '#ffffff',
  'statusBar.noFolderBackground': '#8a0000',
  'statusBar.noFolderForeground': '#ffffff',
  'statusBarItem.remoteBackground': '#990000',
  'statusBarItem.remoteForeground': '#ffffff',
  'statusBarItem.errorBackground': '#cc0000',
  'statusBarItem.errorForeground': '#ffffff',
  'statusBarItem.prominentBackground': '#cc000040',

  // Title bar
  'titleBar.activeBackground': DARK_FRAME,
  'titleBar.activeForeground': '#e0e0e0',
  'titleBar.inactiveBackground': DARK_FRAME,
  'titleBar.inactiveForeground': '#a0a0a099',
  'titleBar.border': DARK_SEAM,

  // Command center
  'commandCenter.foreground': '#cccccc',
  'commandCenter.background': '#202020',
  'commandCenter.border': '#cc000040',
  'commandCenter.activeBackground': '#2a2a2a',
  'commandCenter.activeBorder': '#cc000080',

  // Menus
  'menubar.selectionForeground': '#e0e0e0',
  'menubar.selectionBackground': '#ffffff1a',
  'menu.foreground': '#cccccc',
  'menu.background': DARK_ELEVATED,
  'menu.selectionForeground': '#ffffff',
  'menu.selectionBackground': ACCENT,
  'menu.selectionBorder': '#00000000',
  'menu.separatorBackground': '#454545',
  'menu.border': '#2a2a2a',

  // Buttons
  'button.background': ACCENT,
  'button.foreground': '#ffffff',
  'button.hoverBackground': '#e53939',
  'button.secondaryForeground': '#ffffff',
  'button.secondaryBackground': '#3a3a3a',
  'button.secondaryHoverBackground': '#464646',
  'button.border': '#00000000',

  // Inputs
  'input.background': '#222222',
  'input.border': '#3a3a3a',
  'input.foreground': '#d4d4d4',
  'inputOption.activeBackground': '#cc000033',
  'inputOption.activeBorder': '#cc000080',
  'inputOption.activeForeground': '#ffffff',
  'input.placeholderForeground': '#8a8a8a',
  'inputValidation.errorBackground': '#3a1214',
  'inputValidation.errorBorder': '#be1100',
  'inputValidation.infoBackground': '#12283a',
  'inputValidation.infoBorder': '#0e639c',
  'inputValidation.warningBackground': '#352a12',
  'inputValidation.warningBorder': '#e9a700',
  'textLink.foreground': '#ff6b6b',
  'textLink.activeForeground': '#ff9b9b',

  // Badges
  'badge.background': ACCENT,
  'badge.foreground': '#ffffff',

  // Editor core
  'editor.background': DARK_BG,
  'editor.foreground': '#dcdcdc',
  'editorLineNumber.foreground': '#6b6b6b',
  'editorLineNumber.activeForeground': '#ff8f8f',
  'editorCursor.foreground': '#ffffff',
  'editorCursor.background': '#1e1e1e',
  'editor.selectionBackground': '#4d3c14',
  'editor.selectionForeground': '#ffffff',
  'editor.inactiveSelectionBackground': '#3a2f10',
  // Occurrences of the selected/double-clicked word: teal, clearly off the
  // gold selection, with a visible border.
  'editor.selectionHighlightBackground': '#2f5d7066',
  'editor.selectionHighlightBorder': '#4ec9d47a',
  // Cursor-on-symbol semantic occurrences: read = blue, write = purple.
  'editor.wordHighlightBackground': '#3d5a8055',
  'editor.wordHighlightBorder': '#6a8cc0aa',
  'editor.wordHighlightStrongBackground': '#5a3d8055',
  'editor.wordHighlightStrongBorder': '#9a6ac0aa',
  'editor.wordHighlightTextBackground': '#3d5a8055',
  'editor.wordHighlightTextBorder': '#6a8cc0aa',
  // Find: bright amber with a bright border (distinct from gold selection).
  'editor.findMatchBackground': '#b5641e',
  'editor.findMatchBorder': '#ffb454',
  'editor.findMatchHighlightBackground': '#d9862066',
  'editor.findMatchHighlightBorder': '#ffb45488',
  'editor.findRangeHighlightBackground': '#3a3a3a4d',
  'editor.rangeHighlightBackground': '#ffffff0b',
  'editor.hoverHighlightBackground': '#264f7840',
  'editor.lineHighlightBackground': '#2a2020',
  'editor.lineHighlightBorder': '#00000000',
  'editorWhitespace.foreground': '#ffffff20',
  'editorLink.activeForeground': '#4ec9d4',
  'editorIndentGuide.background': '#3a3a3a',
  'editorIndentGuide.activeBackground': '#cc000080',
  'editorRuler.foreground': '#3a3a3a',
  'editorBracketMatch.background': '#cc000033',
  'editorBracketMatch.border': '#cc0000aa',
  'editor.foldBackground': '#4d3c1433',
  'editorGutter.background': DARK_BG,
  'editorGutter.modifiedBackground': '#4b9fd6',
  'editorGutter.addedBackground': '#6a9955',
  'editorGutter.deletedBackground': '#c74e39',
  'editorGutter.foldingControlForeground': '#c5c5c5',
  'editorGutter.commentRangeForeground': '#c5c5c5',
  'editorCodeLens.foreground': '#8a8a8a',
  'editorGroup.border': DARK_SEAM,
  'editorGroupHeader.tabsBackground': DARK_EDITOR,
  'editorGroupHeader.tabsBorder': DARK_SEAM,
  'editorGroupHeader.noTabsBackground': DARK_EDITOR,
  'editorGroup.emptyBackground': DARK_FRAME,

  // Bracket pair colorization
  'editorBracketHighlight.foreground1': '#ff6b6b',
  'editorBracketHighlight.foreground2': '#4ec9d4',
  'editorBracketHighlight.foreground3': '#d7a860',
  'editorBracketHighlight.foreground4': '#8dd17a',
  'editorBracketHighlight.foreground5': '#c586c0',
  'editorBracketHighlight.foreground6': '#b3c96f',
  'editorBracketHighlight.unexpectedBracket.foreground': '#f44747',

  // Inlay hints, ghost text, sticky scroll
  'editorInlayHint.foreground': '#8a8a8a',
  'editorInlayHint.background': '#ffffff10',
  'editorInlayHint.typeForeground': '#8a8a8a',
  'editorInlayHint.parameterForeground': '#8a8a8a',
  'editorGhostText.foreground': '#6a6a6a',
  'editorStickyScroll.background': DARK_EDITOR,
  'editorStickyScrollHover.background': '#232323',

  // Overview ruler
  'editorOverviewRuler.background': '#1e1e1e00',
  'editorOverviewRuler.border': '#7f7f7f33',
  'editorOverviewRuler.findMatchForeground': '#d18616',
  'editorOverviewRuler.errorForeground': '#f44747',
  'editorOverviewRuler.warningForeground': '#e9a700',
  'editorOverviewRuler.infoForeground': '#4ec9d4',
  'editorOverviewRuler.modifiedForeground': '#4b9fd6',
  'editorOverviewRuler.addedForeground': '#6a9955',
  'editorOverviewRuler.deletedForeground': '#c74e39',

  // Problems
  'editorError.foreground': '#f44747',
  'editorWarning.foreground': '#e9a700',
  'editorInfo.foreground': '#4ec9d4',
  'editorHint.foreground': '#b0b0b0',
  'problemsErrorIcon.foreground': '#f44747',
  'problemsWarningIcon.foreground': '#e9a700',
  'problemsInfoIcon.foreground': '#4ec9d4',

  // Diff
  // Diff: soft line bands + brighter, saturated word-level highlights so the
  // exact changed characters pop within a changed line.
  'diffEditor.insertedTextBackground': '#4bb85c66',
  'diffEditor.removedTextBackground': '#e0556666',
  'diffEditor.insertedLineBackground': '#2a6e3a40',
  'diffEditor.removedLineBackground': '#7a2a3240',
  'diffEditorGutter.insertedLineBackground': '#2a6e3a55',
  'diffEditorGutter.removedLineBackground': '#7a2a3255',
  'diffEditorOverview.insertedForeground': '#3fb95088',
  'diffEditorOverview.removedForeground': '#d8505f88',
  'diffEditor.diagonalFill': '#3a3a3a',
  'diffEditor.border': '#2a2a2a',

  // Panels / terminal
  'panel.background': DARK_SURFACE,
  'panel.border': DARK_SEAM,
  'panelTitle.activeBorder': '#ff6b6b',
  'panelTitle.activeForeground': '#e0e0e0',
  'panelTitle.inactiveForeground': '#a0a0a0',
  'terminal.background': DARK_SURFACE,
  'terminal.foreground': '#d0d0d0',
  'terminal.selectionBackground': '#4d3c1488',
  'terminalCursor.background': '#1e1e1e',
  'terminalCursor.foreground': '#ffffff',
  'terminal.border': '#80808044',
  'terminal.ansiBlack': '#2a2a2a',
  'terminal.ansiBlue': '#569cd6',
  'terminal.ansiBrightBlack': '#767676',
  'terminal.ansiBrightBlue': '#7cb7ff',
  'terminal.ansiBrightCyan': '#4ec9d4',
  'terminal.ansiBrightGreen': '#8dd17a',
  'terminal.ansiBrightMagenta': '#d670d6',
  'terminal.ansiBrightRed': '#ff8888',
  'terminal.ansiBrightWhite': '#ffffff',
  'terminal.ansiBrightYellow': '#e0d060',
  'terminal.ansiCyan': '#29b8db',
  'terminal.ansiGreen': '#89c33c',
  'terminal.ansiMagenta': '#c586c0',
  'terminal.ansiRed': '#ff6666',
  'terminal.ansiWhite': '#cccccc',
  'terminal.ansiYellow': '#d7ba7d',

  // Breadcrumbs
  'breadcrumb.background': DARK_EDITOR,
  'breadcrumb.foreground': '#a0a0a0',
  'breadcrumb.focusForeground': '#e0e0e0',
  'breadcrumb.activeSelectionForeground': '#ff8f8f',
  'breadcrumbPicker.background': DARK_ELEVATED,

  // Tabs
  'tab.activeForeground': '#ffffff',
  'tab.border': DARK_SEAM,
  'tab.activeBackground': DARK_EDITOR,
  'tab.activeBorder': '#ff6b6b',
  'tab.activeBorderTop': '#00000000',
  'tab.inactiveBackground': DARK_SURFACE,
  'tab.inactiveForeground': '#9a9a9a',
  'tab.hoverBackground': '#2a2a2a',
  'tab.hoverForeground': '#ffffff',
  'tab.unfocusedActiveBorder': '#cc000080',
  'tab.lastPinnedBorder': '#cc000040',

  // Scrollbar
  'scrollbarSlider.background': '#79797966',
  'scrollbarSlider.hoverBackground': '#646464b3',
  'scrollbarSlider.activeBackground': '#bfbfbf66',

  // Progress
  'progressBar.background': ACCENT,
  'widget.shadow': '#00000099',

  // Editor widgets
  'editorWidget.foreground': '#cccccc',
  'editorWidget.background': DARK_ELEVATED,
  'editorWidget.border': '#cc000040',
  'editorWidget.resizeBorder': '#5a5a5a',
  'editorSuggestWidget.background': DARK_ELEVATED,
  'editorSuggestWidget.border': '#cc000040',
  'editorSuggestWidget.foreground': '#d4d4d4',
  'editorSuggestWidget.highlightForeground': '#ff6b6b',
  'editorSuggestWidget.focusHighlightForeground': '#ff6b6b',
  'editorSuggestWidget.selectedBackground': '#3a1f1f',
  'editorSuggestWidget.selectedForeground': '#ffffff',
  'editorHoverWidget.foreground': '#cccccc',
  'editorHoverWidget.background': DARK_ELEVATED,
  'editorHoverWidget.border': '#cc000040',
  'pickerGroup.border': '#3a3a3a',
  'pickerGroup.foreground': '#ff8f8f',
  'quickInput.background': DARK_ELEVATED,
  'quickInput.foreground': '#cccccc',
  'quickInputList.focusBackground': '#3a1f1f',
  'quickInputList.focusForeground': '#ff8f8f',

  // Debug
  'debugToolBar.background': DARK_ELEVATED,
  'debugToolBar.border': '#2a2a2a',
  'debugExceptionWidget.background': DARK_ELEVATED,
  'debugExceptionWidget.border': '#2a2a2a',

  // Notifications
  'notifications.foreground': '#cccccc',
  'notifications.background': DARK_ELEVATED,
  'notifications.border': '#2a2a2a',
  'notificationToast.border': '#2a2a2a',
  'notificationsErrorIcon.foreground': '#f44747',
  'notificationsWarningIcon.foreground': '#e9a700',
  'notificationsInfoIcon.foreground': '#4ec9d4',
  'notificationCenter.border': '#2a2a2a',
  'notificationCenterHeader.foreground': '#cccccc',
  'notificationCenterHeader.background': DARK_FRAME,

  // Git decoration
  'gitDecoration.addedResourceForeground': '#81b88b',
  'gitDecoration.conflictingResourceForeground': '#c586c0',
  'gitDecoration.deletedResourceForeground': '#c74e39',
  'gitDecoration.ignoredResourceForeground': '#6a6a6a',
  'gitDecoration.modifiedResourceForeground': '#d7a860',
  'gitDecoration.stageDeletedResourceForeground': '#c74e39',
  'gitDecoration.stageModifiedResourceForeground': '#d7a860',
  'gitDecoration.submoduleResourceForeground': '#4b9fd6',
  'gitDecoration.untrackedResourceForeground': '#8dd17a',

  // Peek view
  'peekView.border': '#cc000080',
  'peekViewEditor.background': '#201a1a',
  'peekViewEditorGutter.background': '#201a1a',
  'peekViewEditor.matchHighlightBackground': '#845820aa',
  'peekViewResult.background': '#1b1b1b',
  'peekViewResult.fileForeground': '#e0e0e0',
  'peekViewResult.lineForeground': '#bbbbbb',
  'peekViewResult.matchHighlightBackground': '#ea5c0044',
  'peekViewResult.selectionBackground': '#3a1f1f',
  'peekViewResult.selectionForeground': '#e0e0e0',
  'peekViewTitle.background': '#1b1b1b',
  'peekViewTitleDescription.foreground': '#cccccce6',
  'peekViewTitleLabel.foreground': '#ffffff',

  // Icons / form controls
  'icon.foreground': '#c5c5c5',
  'checkbox.background': '#222222',
  'checkbox.foreground': '#d4d4d4',
  'checkbox.border': '#3a3a3a',
  'dropdown.background': '#222222',
  'dropdown.foreground': '#d4d4d4',
  'dropdown.border': '#3a3a3a',
  'keybindingLabel.background': '#ffffff12',
  'keybindingLabel.foreground': '#cccccc',
  'keybindingLabel.border': '#ffffff20',
  'keybindingLabel.bottomBorder': '#00000060',

  // Minimap
  'minimapGutter.addedBackground': '#6a9955',
  'minimapGutter.modifiedBackground': '#4b9fd6',
  'minimapGutter.deletedBackground': '#c74e39',
  'minimap.findMatchHighlight': '#d18616',
  'minimap.selectionHighlight': '#4d3c14',
  'minimap.errorHighlight': '#f44747',
  'minimap.warningHighlight': '#e9a700',
  'minimap.background': DARK_BG,

  // Merge conflicts
  'merge.currentHeaderBackground': '#155724aa',
  'merge.currentContentBackground': '#15572455',
  'merge.incomingHeaderBackground': '#1258a7aa',
  'merge.incomingContentBackground': '#1258a755',
  'merge.commonHeaderBackground': '#3a3a3a',
  'merge.commonContentBackground': '#2a2a2a',

  // Settings / misc
  'settings.headerForeground': '#e0e0e0',
  'settings.modifiedItemIndicator': '#cc0000',
  'settings.focusedRowBackground': '#ffffff07',
  'sideBar.dropBackground': '#3a1f1f',
  'panelSection.border': '#80808044',
  'walkThrough.embeddedEditorBackground': '#00000050',

  // Testing
  'testing.iconPassed': '#89c33c',
  'testing.iconFailed': '#f44747',
  'testing.iconErrored': '#f44747',
  'testing.iconSkipped': '#848484',

  // Charts
  'charts.red': '#ff6b6b',
  'charts.blue': '#4ec9d4',
  'charts.yellow': '#d7a860',
  'charts.green': '#8dd17a',
  'charts.orange': '#e0955a',
  'charts.purple': '#c586c0',
  'charts.foreground': '#cccccc',
  'charts.lines': '#cccccc80'
};

/* ------------------------------------------------------------------ *
 * Builders
 * ------------------------------------------------------------------ */

function toDark(hex) {
  if (!hex) return hex;
  const key = hex.toLowerCase();
  return LIGHT_TO_DARK[key] || hex;
}

// Deep-clone a tokenColors entry, optionally remapping colors to dark and
// always stripping fontStyle (re-added per-variant for italic themes).
function transformTokens(tokens, dark) {
  return tokens.map((rule) => {
    const out = { settings: {} };
    if (rule.name) out.name = rule.name;
    out.scope = rule.scope;
    if (rule.settings && rule.settings.foreground) {
      out.settings.foreground = dark
        ? toDark(rule.settings.foreground)
        : rule.settings.foreground;
    }
    // fontStyle intentionally dropped here; italic variants add it back.
    return out;
  });
}

function transformOverrides(overrides, dark) {
  return overrides.map((rule) => {
    const out = { settings: {} };
    if (rule.name) out.name = rule.name;
    out.scope = rule.scope;
    if (rule.settings.foreground) {
      out.settings.foreground = dark
        ? toDark(rule.settings.foreground)
        : rule.settings.foreground;
    }
    if (rule.settings.fontStyle) out.settings.fontStyle = rule.settings.fontStyle;
    return out;
  });
}

function transformSemantic(semantic, dark) {
  const out = {};
  for (const [k, v] of Object.entries(semantic)) {
    out[k] = { foreground: dark ? toDark(v.foreground) : v.foreground };
  }
  return out;
}

function buildTheme({ name, type, dark, italic }) {
  const tokenColors = [
    ...transformTokens(BASE_TOKENS, dark),
    ...transformOverrides(SYNTAX_OVERRIDES, dark)
  ];
  if (italic) tokenColors.push(...ITALIC_RULES.map((r) => ({ ...r })));

  return {
    name,
    type,
    semanticHighlighting: true,
    semanticTokenColors: transformSemantic(SEMANTIC_LIGHT, dark),
    colors: dark ? DARK_COLORS : LIGHT_COLORS,
    tokenColors
  };
}

const VARIANTS = [
  { file: 'crimson-red-light-theme.json', name: 'Crimson Red Light', type: 'light', dark: false, italic: false },
  { file: 'crimson-red-light-italic-theme.json', name: 'Crimson Red Light Italic', type: 'light', dark: false, italic: true },
  { file: 'crimson-red-dark-theme.json', name: 'Crimson Red Dark', type: 'dark', dark: true, italic: false },
  { file: 'crimson-red-dark-italic-theme.json', name: 'Crimson Red Dark Italic', type: 'dark', dark: true, italic: true }
];

for (const v of VARIANTS) {
  const theme = buildTheme(v);
  const dest = path.join(OUT_DIR, v.file);
  fs.writeFileSync(dest, JSON.stringify(theme, null, 2) + '\n', 'utf8');
  console.log(`wrote ${v.file}  (${theme.tokenColors.length} token rules, ${Object.keys(theme.colors).length} colors)`);
}
