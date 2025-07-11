import {
   addEventListener,
   className,
   createComponent,
   createEffect,
   createMemo,
   createRenderEffect,
   createSignal,
   delegateEvents,
   insert,
   memo,
   mergeProps,
   setAttribute,
   ShadowDomTargetContext,
   Show,
   spread,
   template,
   useContext,
   useDevtoolsOnClose,
} from './chunk-NM2VQ3O4.js';
import { interpolatePath, invariant, rootRouteId, trimPath } from './chunk-VMMXHQTH.js';

// ../../node_modules/.deno/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e2) {
   var t2, f, n2 = '';
   if ('string' == typeof e2 || 'number' == typeof e2) n2 += e2;
   else if ('object' == typeof e2) {
      if (Array.isArray(e2)) {
         var o2 = e2.length;
         for (t2 = 0; t2 < o2; t2++) e2[t2] && (f = r(e2[t2])) && (n2 && (n2 += ' '), n2 += f);
      } else for (f in e2) e2[f] && (n2 && (n2 += ' '), n2 += f);
   }
   return n2;
}
function clsx() {
   for (var e2, t2, f = 0, n2 = '', o2 = arguments.length; f < o2; f++) {
      (e2 = arguments[f]) && (t2 = r(e2)) && (n2 && (n2 += ' '), n2 += t2);
   }
   return n2;
}

// ../../node_modules/.deno/goober@2.1.16/node_modules/goober/dist/goober.modern.js
var e = { data: '' };
var t = (t2) =>
   'object' == typeof window
      ? ((t2 ? t2.querySelector('#_goober') : window._goober) ||
         Object.assign((t2 || document.head).appendChild(document.createElement('style')), {
            innerHTML: ' ',
            id: '_goober',
         })).firstChild
      : t2 || e;
var l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
var a = /\/\*[^]*?\*\/|  +/g;
var n = /\n+/g;
var o = (e2, t2) => {
   let r2 = '', l2 = '', a2 = '';
   for (let n2 in e2) {
      let c2 = e2[n2];
      '@' == n2[0]
         ? 'i' == n2[1]
            ? r2 = n2 + ' ' + c2 + ';'
            : l2 += 'f' == n2[1] ? o(c2, n2) : n2 + '{' + o(c2, 'k' == n2[1] ? '' : t2) + '}'
         : 'object' == typeof c2
         ? l2 += o(
            c2,
            t2
               ? t2.replace(/([^,])+/g, (e3) =>
                  n2.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) =>
                     /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + ' ' + t3 : t3))
               : n2,
         )
         : null != c2 &&
            (n2 = /^--/.test(n2) ? n2 : n2.replace(/[A-Z]/g, '-$&').toLowerCase(),
               a2 += o.p ? o.p(n2, c2) : n2 + ':' + c2 + ';');
   }
   return r2 + (t2 && a2 ? t2 + '{' + a2 + '}' : a2) + l2;
};
var c = {};
var s = (e2) => {
   if ('object' == typeof e2) {
      let t2 = '';
      for (let r2 in e2) t2 += r2 + s(e2[r2]);
      return t2;
   }
   return e2;
};
var i = (e2, t2, r2, i2, p2) => {
   let u2 = s(e2),
      d = c[u2] || (c[u2] = ((e3) => {
         let t3 = 0, r3 = 11;
         for (; t3 < e3.length;) r3 = 101 * r3 + e3.charCodeAt(t3++) >>> 0;
         return 'go' + r3;
      })(u2));
   if (!c[d]) {
      let t3 = u2 !== e2 ? e2 : ((e3) => {
         let t4, r3, o2 = [{}];
         for (; t4 = l.exec(e3.replace(a, ''));) {
            t4[4]
               ? o2.shift()
               : t4[3]
               ? (r3 = t4[3].replace(n, ' ').trim(), o2.unshift(o2[0][r3] = o2[0][r3] || {}))
               : o2[0][t4[1]] = t4[2].replace(n, ' ').trim();
         }
         return o2[0];
      })(e2);
      c[d] = o(p2 ? { ['@keyframes ' + d]: t3 } : t3, r2 ? '' : '.' + d);
   }
   let f = r2 && c.g ? c.g : null;
   return r2 && (c.g = c[d]),
      ((e3, t3, r3, l2) => {
         l2
            ? t3.data = t3.data.replace(l2, e3)
            : -1 === t3.data.indexOf(e3) && (t3.data = r3 ? e3 + t3.data : t3.data + e3);
      })(c[d], t2, i2, f),
      d;
};
var p = (e2, t2, r2) =>
   e2.reduce((e3, l2, a2) => {
      let n2 = t2[a2];
      if (n2 && n2.call) {
         let e4 = n2(r2), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
         n2 = t3
            ? '.' + t3
            : e4 && 'object' == typeof e4
            ? e4.props ? '' : o(e4, '')
            : false === e4
            ? ''
            : e4;
      }
      return e3 + l2 + (null == n2 ? '' : n2);
   }, '');
function u(e2) {
   let r2 = this || {}, l2 = e2.call ? e2(r2.p) : e2;
   return i(
      l2.unshift
         ? l2.raw
            ? p(l2, [].slice.call(arguments, 1), r2.p)
            : l2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r2.p) : t2), {})
         : l2,
      t(r2.target),
      r2.g,
      r2.o,
      r2.k,
   );
}
var b = u.bind({ g: 1 });
var h = u.bind({ k: 1 });

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/tokens.js
var tokens = {
   colors: {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      black: '#000000',
      white: '#ffffff',
      neutral: {
         50: '#f9fafb',
         100: '#f2f4f7',
         200: '#eaecf0',
         300: '#d0d5dd',
         400: '#98a2b3',
         500: '#667085',
         600: '#475467',
         700: '#344054',
         800: '#1d2939',
         900: '#101828',
      },
      darkGray: {
         50: '#525c7a',
         100: '#49536e',
         200: '#414962',
         300: '#394056',
         400: '#313749',
         500: '#292e3d',
         600: '#212530',
         700: '#191c24',
         800: '#111318',
         900: '#0b0d10',
      },
      gray: {
         50: '#f9fafb',
         100: '#f2f4f7',
         200: '#eaecf0',
         300: '#d0d5dd',
         400: '#98a2b3',
         500: '#667085',
         600: '#475467',
         700: '#344054',
         800: '#1d2939',
         900: '#101828',
      },
      blue: {
         25: '#F5FAFF',
         50: '#EFF8FF',
         100: '#D1E9FF',
         200: '#B2DDFF',
         300: '#84CAFF',
         400: '#53B1FD',
         500: '#2E90FA',
         600: '#1570EF',
         700: '#175CD3',
         800: '#1849A9',
         900: '#194185',
      },
      green: {
         25: '#F6FEF9',
         50: '#ECFDF3',
         100: '#D1FADF',
         200: '#A6F4C5',
         300: '#6CE9A6',
         400: '#32D583',
         500: '#12B76A',
         600: '#039855',
         700: '#027A48',
         800: '#05603A',
         900: '#054F31',
      },
      red: {
         50: '#fef2f2',
         100: '#fee2e2',
         200: '#fecaca',
         300: '#fca5a5',
         400: '#f87171',
         500: '#ef4444',
         600: '#dc2626',
         700: '#b91c1c',
         800: '#991b1b',
         900: '#7f1d1d',
         950: '#450a0a',
      },
      yellow: {
         25: '#FFFCF5',
         50: '#FFFAEB',
         100: '#FEF0C7',
         200: '#FEDF89',
         300: '#FEC84B',
         400: '#FDB022',
         500: '#F79009',
         600: '#DC6803',
         700: '#B54708',
         800: '#93370D',
         900: '#7A2E0E',
      },
      purple: {
         25: '#FAFAFF',
         50: '#F4F3FF',
         100: '#EBE9FE',
         200: '#D9D6FE',
         300: '#BDB4FE',
         400: '#9B8AFB',
         500: '#7A5AF8',
         600: '#6938EF',
         700: '#5925DC',
         800: '#4A1FB8',
         900: '#3E1C96',
      },
      teal: {
         25: '#F6FEFC',
         50: '#F0FDF9',
         100: '#CCFBEF',
         200: '#99F6E0',
         300: '#5FE9D0',
         400: '#2ED3B7',
         500: '#15B79E',
         600: '#0E9384',
         700: '#107569',
         800: '#125D56',
         900: '#134E48',
      },
      pink: {
         25: '#fdf2f8',
         50: '#fce7f3',
         100: '#fbcfe8',
         200: '#f9a8d4',
         300: '#f472b6',
         400: '#ec4899',
         500: '#db2777',
         600: '#be185d',
         700: '#9d174d',
         800: '#831843',
         900: '#500724',
      },
      cyan: {
         25: '#ecfeff',
         50: '#cffafe',
         100: '#a5f3fc',
         200: '#67e8f9',
         300: '#22d3ee',
         400: '#06b6d4',
         500: '#0891b2',
         600: '#0e7490',
         700: '#155e75',
         800: '#164e63',
         900: '#083344',
      },
   },
   alpha: {
      90: 'e5',
      70: 'b3',
      20: '33',
   },
   font: {
      size: {
         '2xs': 'calc(var(--tsrd-font-size) * 0.625)',
         xs: 'calc(var(--tsrd-font-size) * 0.75)',
         sm: 'calc(var(--tsrd-font-size) * 0.875)',
         md: 'var(--tsrd-font-size)',
      },
      lineHeight: {
         xs: 'calc(var(--tsrd-font-size) * 1)',
         sm: 'calc(var(--tsrd-font-size) * 1.25)',
      },
      weight: {
         normal: '400',
         medium: '500',
         semibold: '600',
         bold: '700',
      },
      fontFamily: {
         sans: 'ui-sans-serif, Inter, system-ui, sans-serif, sans-serif',
         mono:
            `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
      },
   },
   border: {
      radius: {
         xs: 'calc(var(--tsrd-font-size) * 0.125)',
         sm: 'calc(var(--tsrd-font-size) * 0.25)',
         md: 'calc(var(--tsrd-font-size) * 0.375)',
         full: '9999px',
      },
   },
   size: {
      0: '0px',
      0.5: 'calc(var(--tsrd-font-size) * 0.125)',
      1: 'calc(var(--tsrd-font-size) * 0.25)',
      1.5: 'calc(var(--tsrd-font-size) * 0.375)',
      2: 'calc(var(--tsrd-font-size) * 0.5)',
      2.5: 'calc(var(--tsrd-font-size) * 0.625)',
      3: 'calc(var(--tsrd-font-size) * 0.75)',
      3.5: 'calc(var(--tsrd-font-size) * 0.875)',
      4: 'calc(var(--tsrd-font-size) * 1)',
      5: 'calc(var(--tsrd-font-size) * 1.25)',
      8: 'calc(var(--tsrd-font-size) * 2)',
   },
};

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/useStyles.js
var stylesFactory = (shadowDOMTarget) => {
   const {
      colors,
      font,
      size,
      alpha,
      border,
   } = tokens;
   const {
      fontFamily,
      lineHeight,
      size: fontSize,
   } = font;
   const css = shadowDOMTarget
      ? u.bind({
         target: shadowDOMTarget,
      })
      : u;
   return {
      devtoolsPanelContainer: css`
         direction: ltr;
         position: fixed;
         bottom: 0;
         right: 0;
         z-index: 99999;
         width: 100%;
         max-height: 90%;
         border-top: 1px solid ${colors.gray[700]};
         transform-origin: top;
      `,
      devtoolsPanelContainerVisibility: (isOpen) => {
         return css`
            visibility: ${isOpen ? 'visible' : 'hidden'};
         `;
      },
      devtoolsPanelContainerResizing: (isResizing) => {
         if (isResizing()) {
            return css`
               transition: none;
            `;
         }
         return css`
            transition: all 0.4s ease;
         `;
      },
      devtoolsPanelContainerAnimation: (isOpen, height) => {
         if (isOpen) {
            return css`
               pointer-events: auto;
               transform: translateY(0);
            `;
         }
         return css`
            pointer-events: none;
            transform: translateY(${height}px);
         `;
      },
      logo: css`
         cursor: pointer;
         display: flex;
         flex-direction: column;
         background-color: transparent;
         border: none;
         font-family: ${fontFamily.sans};
         gap: ${tokens.size[0.5]};
         padding: 0px;
         &:hover {
            opacity: 0.7;
         }
         &:focus-visible {
            outline-offset: 4px;
            border-radius: ${border.radius.xs};
            outline: 2px solid ${colors.blue[800]};
         }
      `,
      tanstackLogo: css`
         font-size: ${font.size.md};
         font-weight: ${font.weight.bold};
         line-height: ${font.lineHeight.xs};
         white-space: nowrap;
         color: ${colors.gray[300]};
      `,
      routerLogo: css`
         font-weight: ${font.weight.semibold};
         font-size: ${font.size.xs};
         background: linear-gradient(to right, #84cc16, #10b981);
         background-clip: text;
         -webkit-background-clip: text;
         line-height: 1;
         -webkit-text-fill-color: transparent;
         white-space: nowrap;
      `,
      devtoolsPanel: css`
         display: flex;
         font-size: ${fontSize.sm};
         font-family: ${fontFamily.sans};
         background-color: ${colors.darkGray[700]};
         color: ${colors.gray[300]};

         @media (max-width: 700px) {
            flex-direction: column;
         }
         @media (max-width: 600px) {
            font-size: ${fontSize.xs};
         }
      `,
      dragHandle: css`
         position: absolute;
         left: 0;
         top: 0;
         width: 100%;
         height: 4px;
         cursor: row-resize;
         z-index: 100000;
         &:hover {
            background-color: ${colors.purple[400]} ${alpha[90]};
         }
      `,
      firstContainer: css`
         flex: 1 1 500px;
         min-height: 40%;
         max-height: 100%;
         overflow: auto;
         border-right: 1px solid ${colors.gray[700]};
         display: flex;
         flex-direction: column;
      `,
      routerExplorerContainer: css`
         overflow-y: auto;
         flex: 1;
      `,
      routerExplorer: css`
         padding: ${tokens.size[2]};
      `,
      row: css`
         display: flex;
         align-items: center;
         padding: ${tokens.size[2]} ${tokens.size[2.5]};
         gap: ${tokens.size[2.5]};
         border-bottom: ${colors.darkGray[500]} 1px solid;
         align-items: center;
      `,
      detailsHeader: css`
         font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
         position: sticky;
         top: 0;
         z-index: 2;
         background-color: ${colors.darkGray[600]};
         padding: 0px ${tokens.size[2]};
         font-weight: ${font.weight.medium};
         font-size: ${font.size.xs};
         min-height: ${tokens.size[8]};
         line-height: ${font.lineHeight.xs};
         text-align: left;
         display: flex;
         align-items: center;
      `,
      maskedBadge: css`
         background: ${colors.yellow[900]} ${alpha[70]};
         color: ${colors.yellow[300]};
         display: inline-block;
         padding: ${tokens.size[0]} ${tokens.size[2.5]};
         border-radius: ${border.radius.full};
         font-size: ${font.size.xs};
         font-weight: ${font.weight.normal};
         border: 1px solid ${colors.yellow[300]};
      `,
      maskedLocation: css`
         color: ${colors.yellow[300]};
      `,
      detailsContent: css`
         padding: ${tokens.size[1.5]} ${tokens.size[2]};
         display: flex;
         align-items: center;
         justify-content: space-between;
         font-size: ${font.size.xs};
      `,
      routeMatchesToggle: css`
         display: flex;
         align-items: center;
         border: 1px solid ${colors.gray[500]};
         border-radius: ${border.radius.sm};
         overflow: hidden;
      `,
      routeMatchesToggleBtn: (active, showBorder) => {
         const base = css`
            appearance: none;
            border: none;
            font-size: 12px;
            padding: 4px 8px;
            background: transparent;
            cursor: pointer;
            font-family: ${fontFamily.sans};
            font-weight: ${font.weight.medium};
         `;
         const classes = [base];
         if (active) {
            const activeStyles = css`
               background: ${colors.darkGray[400]};
               color: ${colors.gray[300]};
            `;
            classes.push(activeStyles);
         } else {
            const inactiveStyles = css`
               color: ${colors.gray[500]};
               background: ${colors.darkGray[800]} ${alpha[20]};
            `;
            classes.push(inactiveStyles);
         }
         if (showBorder) {
            classes.push(css`
               border-right: 1px solid ${tokens.colors.gray[500]};
            `);
         }
         return classes;
      },
      detailsHeaderInfo: css`
         flex: 1;
         justify-content: flex-end;
         display: flex;
         align-items: center;
         font-weight: ${font.weight.normal};
         color: ${colors.gray[400]};
      `,
      matchRow: (active) => {
         const base = css`
            display: flex;
            border-bottom: 1px solid ${colors.darkGray[400]};
            cursor: pointer;
            align-items: center;
            padding: ${size[1]} ${size[2]};
            gap: ${size[2]};
            font-size: ${fontSize.xs};
            color: ${colors.gray[300]};
         `;
         const classes = [base];
         if (active) {
            const activeStyles = css`
               background: ${colors.darkGray[500]};
            `;
            classes.push(activeStyles);
         }
         return classes;
      },
      matchIndicator: (color) => {
         const base = css`
            flex: 0 0 auto;
            width: ${size[3]};
            height: ${size[3]};
            background: ${colors[color][900]};
            border: 1px solid ${colors[color][500]};
            border-radius: ${border.radius.full};
            transition: all 0.25s ease-out;
            box-sizing: border-box;
         `;
         const classes = [base];
         if (color === 'gray') {
            const grayStyles = css`
               background: ${colors.gray[700]};
               border-color: ${colors.gray[400]};
            `;
            classes.push(grayStyles);
         }
         return classes;
      },
      matchID: css`
         flex: 1;
         line-height: ${lineHeight['xs']};
      `,
      ageTicker: (showWarning) => {
         const base = css`
            display: flex;
            gap: ${size[1]};
            font-size: ${fontSize.xs};
            color: ${colors.gray[400]};
            font-variant-numeric: tabular-nums;
            line-height: ${lineHeight['xs']};
         `;
         const classes = [base];
         if (showWarning) {
            const warningStyles = css`
               color: ${colors.yellow[400]};
            `;
            classes.push(warningStyles);
         }
         return classes;
      },
      secondContainer: css`
         flex: 1 1 500px;
         min-height: 40%;
         max-height: 100%;
         overflow: auto;
         border-right: 1px solid ${colors.gray[700]};
         display: flex;
         flex-direction: column;
      `,
      thirdContainer: css`
         flex: 1 1 500px;
         overflow: auto;
         display: flex;
         flex-direction: column;
         height: 100%;
         border-right: 1px solid ${colors.gray[700]};

         @media (max-width: 700px) {
            border-top: 2px solid ${colors.gray[700]};
         }
      `,
      fourthContainer: css`
         flex: 1 1 500px;
         min-height: 40%;
         max-height: 100%;
         overflow: auto;
         display: flex;
         flex-direction: column;
      `,
      routesContainer: css`
         overflow-x: auto;
         overflow-y: visible;
      `,
      routesRowContainer: (active, isMatch) => {
         const base = css`
            display: flex;
            border-bottom: 1px solid ${colors.darkGray[400]};
            align-items: center;
            padding: ${size[1]} ${size[2]};
            gap: ${size[2]};
            font-size: ${fontSize.xs};
            color: ${colors.gray[300]};
            cursor: ${isMatch ? 'pointer' : 'default'};
            line-height: ${lineHeight['xs']};
         `;
         const classes = [base];
         if (active) {
            const activeStyles = css`
               background: ${colors.darkGray[500]};
            `;
            classes.push(activeStyles);
         }
         return classes;
      },
      routesRow: (isMatch) => {
         const base = css`
            flex: 1 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${fontSize.xs};
            line-height: ${lineHeight['xs']};
         `;
         const classes = [base];
         if (!isMatch) {
            const matchStyles = css`
               color: ${colors.gray[400]};
            `;
            classes.push(matchStyles);
         }
         return classes;
      },
      routesRowInner: css`
         display: "flex";
         align-items: "center";
         flex-grow: 1;
         min-width: 0;
      `,
      routeParamInfo: css`
         color: ${colors.gray[400]};
         font-size: ${fontSize.xs};
         line-height: ${lineHeight['xs']};
      `,
      nestedRouteRow: (isRoot) => {
         const base = css`
            margin-left: ${isRoot ? 0 : size[3.5]};
            border-left: ${isRoot ? '' : `solid 1px ${colors.gray[700]}`};
         `;
         return base;
      },
      code: css`
         font-size: ${fontSize.xs};
         line-height: ${lineHeight['xs']};
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
      `,
      matchesContainer: css`
         flex: 1 1 auto;
         overflow-y: auto;
      `,
      cachedMatchesContainer: css`
         flex: 1 1 auto;
         overflow-y: auto;
         max-height: 50%;
      `,
      maskedBadgeContainer: css`
         flex: 1;
         justify-content: flex-end;
         display: flex;
      `,
      matchDetails: css`
         display: flex;
         flex-direction: column;
         padding: ${tokens.size[2]};
         font-size: ${tokens.font.size.xs};
         color: ${tokens.colors.gray[300]};
         line-height: ${tokens.font.lineHeight.sm};
      `,
      matchStatus: (status, isFetching) => {
         const colorMap = {
            pending: 'yellow',
            success: 'green',
            error: 'red',
            notFound: 'purple',
            redirected: 'gray',
         };
         const color = isFetching && status === 'success'
            ? isFetching === 'beforeLoad' ? 'purple' : 'blue'
            : colorMap[status];
         return css`
            display: flex;
            justify-content: center;
            align-items: center;
            height: 40px;
            border-radius: ${tokens.border.radius.sm};
            font-weight: ${tokens.font.weight.normal};
            background-color: ${tokens.colors[color][900]} ${tokens.alpha[90]};
            color: ${tokens.colors[color][300]};
            border: 1px solid ${tokens.colors[color][600]};
            margin-bottom: ${tokens.size[2]};
            transition: all 0.25s ease-out;
         `;
      },
      matchDetailsInfo: css`
         display: flex;
         justify-content: flex-end;
         flex: 1;
      `,
      matchDetailsInfoLabel: css`
         display: flex;
      `,
      mainCloseBtn: css`
         background: ${colors.darkGray[700]};
         padding: ${size[1]} ${size[2]} ${size[1]} ${size[1.5]};
         border-radius: ${border.radius.md};
         position: fixed;
         z-index: 99999;
         display: inline-flex;
         width: fit-content;
         cursor: pointer;
         appearance: none;
         border: 0;
         gap: 8px;
         align-items: center;
         border: 1px solid ${colors.gray[500]};
         font-size: ${font.size.xs};
         cursor: pointer;
         transition: all 0.25s ease-out;

         &:hover {
            background: ${colors.darkGray[500]};
         }
      `,
      mainCloseBtnPosition: (position) => {
         const base = css`
            ${position === 'top-left'
               ? `top: ${size[2]}; left: ${size[2]};`
               : ''} ${position === 'top-right'
               ? `top: ${size[2]}; right: ${size[2]};`
               : ''} ${position === 'bottom-left'
               ? `bottom: ${size[2]}; left: ${size[2]};`
               : ''} ${position === 'bottom-right' ? `bottom: ${size[2]}; right: ${size[2]};` : ''};
         `;
         return base;
      },
      mainCloseBtnAnimation: (isOpen) => {
         if (!isOpen) {
            return css`
               opacity: 1;
               pointer-events: auto;
               visibility: visible;
            `;
         }
         return css`
            opacity: 0;
            pointer-events: none;
            visibility: hidden;
         `;
      },
      routerLogoCloseButton: css`
         font-weight: ${font.weight.semibold};
         font-size: ${font.size.xs};
         background: linear-gradient(to right, #98f30c, #00f4a3);
         background-clip: text;
         -webkit-background-clip: text;
         line-height: 1;
         -webkit-text-fill-color: transparent;
         white-space: nowrap;
      `,
      mainCloseBtnDivider: css`
         width: 1px;
         background: ${tokens.colors.gray[600]};
         height: 100%;
         border-radius: 999999px;
         color: transparent;
      `,
      mainCloseBtnIconContainer: css`
         position: relative;
         width: ${size[5]};
         height: ${size[5]};
         background: pink;
         border-radius: 999999px;
         overflow: hidden;
      `,
      mainCloseBtnIconOuter: css`
         width: ${size[5]};
         height: ${size[5]};
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         filter: blur(3px) saturate(1.8) contrast(2);
      `,
      mainCloseBtnIconInner: css`
         width: ${size[4]};
         height: ${size[4]};
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
      `,
      panelCloseBtn: css`
         position: absolute;
         cursor: pointer;
         z-index: 100001;
         display: flex;
         align-items: center;
         justify-content: center;
         outline: none;
         background-color: ${colors.darkGray[700]};
         &:hover {
            background-color: ${colors.darkGray[500]};
         }

         top: 0;
         right: ${size[2]};
         transform: translate(0, -100%);
         border-right: ${colors.darkGray[300]} 1px solid;
         border-left: ${colors.darkGray[300]} 1px solid;
         border-top: ${colors.darkGray[300]} 1px solid;
         border-bottom: none;
         border-radius: ${border.radius.sm} ${border.radius.sm} 0px 0px;
         padding: ${size[1]} ${size[1.5]} ${size[0.5]} ${size[1.5]};

         &::after {
            content: " ";
            position: absolute;
            top: 100%;
            left: -${size[2.5]};
            height: ${size[1.5]};
            width: calc(100% + ${size[5]});
         }
      `,
      panelCloseBtnIcon: css`
         color: ${colors.gray[400]};
         width: ${size[2]};
         height: ${size[2]};
      `,
      navigateButton: css`
         background: none;
         border: none;
         padding: 0 0 0 4px;
         margin: 0;
         color: ${colors.gray[400]};
         font-size: ${fontSize.md};
         cursor: pointer;
         line-height: 1;
         vertical-align: middle;
         margin-right: 0.5ch;
         flex-shrink: 0;
         &:hover {
            color: ${colors.blue[300]};
         }
      `,
   };
};
function useStyles() {
   const shadowDomTarget = useContext(ShadowDomTargetContext);
   const [_styles] = createSignal(stylesFactory(shadowDomTarget));
   return _styles;
}

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/useLocalStorage.js
var getItem = (key) => {
   try {
      const itemValue = localStorage.getItem(key);
      if (typeof itemValue === 'string') {
         return JSON.parse(itemValue);
      }
      return void 0;
   } catch {
      return void 0;
   }
};
function useLocalStorage(key, defaultValue) {
   const [value, setValue] = createSignal();
   createEffect(() => {
      const initialValue = getItem(key);
      if (typeof initialValue === 'undefined' || initialValue === null) {
         setValue(
            typeof defaultValue === 'function' ? defaultValue() : defaultValue,
         );
      } else {
         setValue(initialValue);
      }
   });
   const setter = (updater) => {
      setValue((old) => {
         let newVal = updater;
         if (typeof updater == 'function') {
            newVal = updater(old);
         }
         try {
            localStorage.setItem(key, JSON.stringify(newVal));
         } catch {
         }
         return newVal;
      });
   };
   return [value, setter];
}

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/utils.js
var isServer = typeof window === 'undefined';
function getStatusColor(match) {
   const colorMap = {
      pending: 'yellow',
      success: 'green',
      error: 'red',
      notFound: 'purple',
      redirected: 'gray',
   };
   return match.isFetching && match.status === 'success'
      ? match.isFetching === 'beforeLoad' ? 'purple' : 'blue'
      : colorMap[match.status];
}
function getRouteStatusColor(matches, route) {
   const found = matches.find((d) => d.routeId === route.id);
   if (!found) return 'gray';
   return getStatusColor(found);
}
function useIsMounted() {
   const [isMounted, setIsMounted] = createSignal(false);
   const effect = isServer ? createEffect : createRenderEffect;
   effect(() => {
      setIsMounted(true);
   });
   return isMounted;
}
var displayValue = (value) => {
   const name = Object.getOwnPropertyNames(Object(value));
   const newValue = typeof value === 'bigint' ? `${value.toString()}n` : value;
   try {
      return JSON.stringify(newValue, name);
   } catch (e2) {
      return `unable to stringify`;
   }
};
function multiSortBy(arr, accessors = [(d) => d]) {
   return arr.map((d, i2) => [d, i2]).sort(([a2, ai], [b2, bi]) => {
      for (const accessor of accessors) {
         const ao = accessor(a2);
         const bo = accessor(b2);
         if (typeof ao === 'undefined') {
            if (typeof bo === 'undefined') {
               continue;
            }
            return 1;
         }
         if (ao === bo) {
            continue;
         }
         return ao > bo ? 1 : -1;
      }
      return ai - bi;
   }).map(([d]) => d);
}

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/Explorer.js
var _tmpl$ = template(
   `<span><svg xmlns=http://www.w3.org/2000/svg width=12 height=12 fill=none viewBox="0 0 24 24"><path stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=2 d="M9 18l6-6-6-6">`,
);
var _tmpl$2 = template(`<div>`);
var _tmpl$3 = template(`<button><span> `);
var _tmpl$4 = template(`<div><div><button> [<!> ... <!>]`);
var _tmpl$5 = template(`<button><span></span> 🔄 `);
var _tmpl$6 = template(`<span>:`);
var _tmpl$7 = template(`<span>`);
var Expander = ({
   expanded,
   style = {},
}) => {
   const styles = useStyles2();
   return (() => {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
         var _v$ = styles().expander, _v$2 = clsx(styles().expanderIcon(expanded));
         _v$ !== _p$.e && className(_el$, _p$.e = _v$);
         _v$2 !== _p$.t && setAttribute(_el$2, 'class', _p$.t = _v$2);
         return _p$;
      }, {
         e: void 0,
         t: void 0,
      });
      return _el$;
   })();
};
function chunkArray(array, size) {
   if (size < 1) return [];
   let i2 = 0;
   const result = [];
   while (i2 < array.length) {
      result.push(array.slice(i2, i2 + size));
      i2 = i2 + size;
   }
   return result;
}
function isIterable(x) {
   return Symbol.iterator in x;
}
function Explorer({
   value,
   defaultExpanded,
   pageSize = 100,
   filterSubEntries,
   ...rest
}) {
   const [expanded, setExpanded] = createSignal(Boolean(defaultExpanded));
   const toggleExpanded = () => setExpanded((old) => !old);
   const type = createMemo(() => typeof value());
   const subEntries = createMemo(() => {
      let entries = [];
      const makeProperty = (sub) => {
         const subDefaultExpanded = defaultExpanded === true
            ? {
               [sub.label]: true,
            }
            : defaultExpanded == null
            ? void 0
            : defaultExpanded[sub.label];
         return {
            ...sub,
            value: () => sub.value,
            defaultExpanded: subDefaultExpanded,
         };
      };
      if (Array.isArray(value())) {
         entries = value().map((d, i2) =>
            makeProperty({
               label: i2.toString(),
               value: d,
            })
         );
      } else if (
         value() !== null && typeof value() === 'object' && isIterable(value()) &&
         typeof value()[Symbol.iterator] === 'function'
      ) {
         entries = Array.from(value(), (val, i2) =>
            makeProperty({
               label: i2.toString(),
               value: val,
            }));
      } else if (typeof value() === 'object' && value() !== null) {
         entries = Object.entries(value()).map(([key, val]) =>
            makeProperty({
               label: key,
               value: val,
            })
         );
      }
      return filterSubEntries ? filterSubEntries(entries) : entries;
   });
   const subEntryPages = createMemo(() => chunkArray(subEntries(), pageSize));
   const [expandedPages, setExpandedPages] = createSignal([]);
   const [valueSnapshot, setValueSnapshot] = createSignal(void 0);
   const styles = useStyles2();
   const refreshValueSnapshot = () => {
      setValueSnapshot(value()());
   };
   const handleEntry = (entry) =>
      createComponent(
         Explorer,
         mergeProps(
            {
               value,
               filterSubEntries,
            },
            rest,
            entry,
         ),
      );
   return (() => {
      var _el$3 = _tmpl$2();
      insert(
         _el$3,
         (() => {
            var _c$ = memo(() => !!subEntryPages().length);
            return () =>
               _c$()
                  ? [
                     (() => {
                        var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild;
                        _el$4.$$click = () => toggleExpanded();
                        insert(
                           _el$4,
                           createComponent(Expander, {
                              get expanded() {
                                 return expanded() ?? false;
                              },
                           }),
                           _el$5,
                        );
                        insert(_el$4, () => rest.label, _el$5);
                        insert(
                           _el$5,
                           () => String(type).toLowerCase() === 'iterable' ? '(Iterable) ' : '',
                           _el$6,
                        );
                        insert(_el$5, () => subEntries().length, _el$6);
                        insert(_el$5, () => subEntries().length > 1 ? `items` : `item`, null);
                        createRenderEffect((_p$) => {
                           var _v$3 = styles().expandButton, _v$4 = styles().info;
                           _v$3 !== _p$.e && className(_el$4, _p$.e = _v$3);
                           _v$4 !== _p$.t && className(_el$5, _p$.t = _v$4);
                           return _p$;
                        }, {
                           e: void 0,
                           t: void 0,
                        });
                        return _el$4;
                     })(),
                     memo(() =>
                        memo(() => !!(expanded() ?? false))()
                           ? memo(() => subEntryPages().length === 1)()
                              ? (() => {
                                 var _el$7 = _tmpl$2();
                                 insert(
                                    _el$7,
                                    () => subEntries().map((entry, index) => handleEntry(entry)),
                                 );
                                 createRenderEffect(() => className(_el$7, styles().subEntries));
                                 return _el$7;
                              })()
                              : (() => {
                                 var _el$8 = _tmpl$2();
                                 insert(_el$8, () =>
                                    subEntryPages().map((entries, index) => {
                                       return (() => {
                                          var _el$9 = _tmpl$4(),
                                             _el$0 = _el$9.firstChild,
                                             _el$1 = _el$0.firstChild,
                                             _el$10 = _el$1.firstChild,
                                             _el$15 = _el$10.nextSibling,
                                             _el$12 = _el$15.nextSibling,
                                             _el$16 = _el$12.nextSibling;
                                          _el$16.nextSibling;
                                          _el$1.$$click = () =>
                                             setExpandedPages((old) =>
                                                old.includes(index)
                                                   ? old.filter((d) => d !== index)
                                                   : [...old, index]
                                             );
                                          insert(
                                             _el$1,
                                             createComponent(Expander, {
                                                get expanded() {
                                                   return expandedPages().includes(index);
                                                },
                                             }),
                                             _el$10,
                                          );
                                          insert(_el$1, index * pageSize, _el$15);
                                          insert(_el$1, index * pageSize + pageSize - 1, _el$16);
                                          insert(
                                             _el$0,
                                             (() => {
                                                var _c$3 = memo(() =>
                                                   !!expandedPages().includes(index)
                                                );
                                                return () =>
                                                   _c$3()
                                                      ? (() => {
                                                         var _el$17 = _tmpl$2();
                                                         insert(_el$17, () =>
                                                            entries.map((entry) =>
                                                               handleEntry(entry)
                                                            ));
                                                         createRenderEffect(() =>
                                                            className(_el$17, styles().subEntries)
                                                         );
                                                         return _el$17;
                                                      })()
                                                      : null;
                                             })(),
                                             null,
                                          );
                                          createRenderEffect((_p$) => {
                                             var _v$5 = styles().entry,
                                                _v$6 = clsx(styles().labelButton, 'labelButton');
                                             _v$5 !== _p$.e && className(_el$0, _p$.e = _v$5);
                                             _v$6 !== _p$.t && className(_el$1, _p$.t = _v$6);
                                             return _p$;
                                          }, {
                                             e: void 0,
                                             t: void 0,
                                          });
                                          return _el$9;
                                       })();
                                    }));
                                 createRenderEffect(() =>
                                    className(_el$8, styles().subEntries)
                                 );
                                 return _el$8;
                              })()
                           : null
                     ),
                  ]
                  : (() => {
                     var _c$2 = memo(() => type() === 'function');
                     return () =>
                        _c$2()
                           ? createComponent(Explorer, {
                              get label() {
                                 return (() => {
                                    var _el$18 = _tmpl$5(), _el$19 = _el$18.firstChild;
                                    _el$18.$$click = refreshValueSnapshot;
                                    insert(_el$19, () => rest.label);
                                    createRenderEffect(() =>
                                       className(_el$18, styles().refreshValueBtn)
                                    );
                                    return _el$18;
                                 })();
                              },
                              value: valueSnapshot,
                              defaultExpanded: {},
                           })
                           : [
                              (() => {
                                 var _el$20 = _tmpl$6(), _el$21 = _el$20.firstChild;
                                 insert(_el$20, () => rest.label, _el$21);
                                 return _el$20;
                              })(),
                              ' ',
                              (() => {
                                 var _el$22 = _tmpl$7();
                                 insert(_el$22, () => displayValue(value()));
                                 createRenderEffect(() => className(_el$22, styles().value));
                                 return _el$22;
                              })(),
                           ];
                  })();
         })(),
      );
      createRenderEffect(() => className(_el$3, styles().entry));
      return _el$3;
   })();
}
var stylesFactory2 = (shadowDOMTarget) => {
   const {
      colors,
      font,
      size,
   } = tokens;
   const {
      fontFamily,
      lineHeight,
      size: fontSize,
   } = font;
   const css = shadowDOMTarget
      ? u.bind({
         target: shadowDOMTarget,
      })
      : u;
   return {
      entry: css`
         font-family: ${fontFamily.mono};
         font-size: ${fontSize.xs};
         line-height: ${lineHeight.sm};
         outline: none;
         word-break: break-word;
      `,
      labelButton: css`
         cursor: pointer;
         color: inherit;
         font: inherit;
         outline: inherit;
         background: transparent;
         border: none;
         padding: 0;
      `,
      expander: css`
         display: inline-flex;
         align-items: center;
         justify-content: center;
         width: ${size[3]};
         height: ${size[3]};
         padding-left: 3px;
         box-sizing: content-box;
      `,
      expanderIcon: (expanded) => {
         if (expanded) {
            return css`
               transform: rotate(90deg);
               transition: transform 0.1s ease;
            `;
         }
         return css`
            transform: rotate(0deg);
            transition: transform 0.1s ease;
         `;
      },
      expandButton: css`
         display: flex;
         gap: ${size[1]};
         align-items: center;
         cursor: pointer;
         color: inherit;
         font: inherit;
         outline: inherit;
         background: transparent;
         border: none;
         padding: 0;
      `,
      value: css`
         color: ${colors.purple[400]};
      `,
      subEntries: css`
         margin-left: ${size[2]};
         padding-left: ${size[2]};
         border-left: 2px solid ${colors.darkGray[400]};
      `,
      info: css`
         color: ${colors.gray[500]};
         font-size: ${fontSize['2xs']};
         padding-left: ${size[1]};
      `,
      refreshValueBtn: css`
         appearance: none;
         border: 0;
         cursor: pointer;
         background: transparent;
         color: inherit;
         padding: 0;
         font-family: ${fontFamily.mono};
         font-size: ${fontSize.xs};
      `,
   };
};
function useStyles2() {
   const shadowDomTarget = useContext(ShadowDomTargetContext);
   const [_styles] = createSignal(stylesFactory2(shadowDomTarget));
   return _styles;
}
delegateEvents(['click']);

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/AgeTicker.js
var _tmpl$8 = template(`<div><div></div><div>/</div><div></div><div>/</div><div>`);
function formatTime(ms) {
   const units = ['s', 'min', 'h', 'd'];
   const values = [ms / 1e3, ms / 6e4, ms / 36e5, ms / 864e5];
   let chosenUnitIndex = 0;
   for (let i2 = 1; i2 < values.length; i2++) {
      if (values[i2] < 1) break;
      chosenUnitIndex = i2;
   }
   const formatter = new Intl.NumberFormat(navigator.language, {
      compactDisplay: 'short',
      notation: 'compact',
      maximumFractionDigits: 0,
   });
   return formatter.format(values[chosenUnitIndex]) + units[chosenUnitIndex];
}
function AgeTicker({
   match,
   router,
}) {
   const styles = useStyles();
   if (!match) {
      return null;
   }
   const route = router().looseRoutesById[match.routeId];
   if (!route.options.loader) {
      return null;
   }
   const age = Date.now() - match.updatedAt;
   const staleTime = route.options.staleTime ?? router().options.defaultStaleTime ?? 0;
   const gcTime = route.options.gcTime ?? router().options.defaultGcTime ?? 30 * 60 * 1e3;
   return (() => {
      var _el$ = _tmpl$8(),
         _el$2 = _el$.firstChild,
         _el$3 = _el$2.nextSibling,
         _el$4 = _el$3.nextSibling,
         _el$5 = _el$4.nextSibling,
         _el$6 = _el$5.nextSibling;
      insert(_el$2, () => formatTime(age));
      insert(_el$4, () => formatTime(staleTime));
      insert(_el$6, () => formatTime(gcTime));
      createRenderEffect(() => className(_el$, clsx(styles().ageTicker(age > staleTime))));
      return _el$;
   })();
}

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/NavigateButton.js
var _tmpl$9 = template(`<button type=button>➔`);
function NavigateButton({
   to,
   params,
   search,
   router,
}) {
   const styles = useStyles();
   return (() => {
      var _el$ = _tmpl$9();
      _el$.$$click = (e2) => {
         e2.stopPropagation();
         router().navigate({
            to,
            params,
            search,
         });
      };
      setAttribute(_el$, 'title', `Navigate to ${to}`);
      createRenderEffect(() => className(_el$, styles().navigateButton));
      return _el$;
   })();
}
delegateEvents(['click']);

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/BaseTanStackRouterDevtoolsPanel.js
var _tmpl$10 = template(`<button><div>TANSTACK</div><div>TanStack Router v1`);
var _tmpl$22 = template(`<div><div>`);
var _tmpl$32 = template(`<code> `);
var _tmpl$42 = template(`<code>`);
var _tmpl$52 = template(`<div><div role=button><div>`);
var _tmpl$62 = template(`<div>`);
var _tmpl$72 = template(
   `<div><button><svg xmlns=http://www.w3.org/2000/svg width=10 height=6 fill=none viewBox="0 0 10 6"><path stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=1.667 d="M1 1l4 4 4-4"></path></svg></button><div><div></div><div><div></div></div></div><div><div><div><span>Pathname</span></div><div><code></code></div><div><div><button type=button>Routes</button><button type=button>Matches</button></div><div><div>age / staleTime / gcTime</div></div></div><div>`,
);
var _tmpl$82 = template(`<div><span>masked`);
var _tmpl$92 = template(`<div role=button><div>`);
var _tmpl$0 = template(
   `<div><div><div>Cached Matches</div><div>age / staleTime / gcTime</div></div><div>`,
);
var _tmpl$1 = template(
   `<div><div>Match Details</div><div><div><div><div></div></div><div><div>ID:</div><div><code></code></div></div><div><div>State:</div><div></div></div><div><div>Last Updated:</div><div></div></div></div></div><div>Explorer</div><div>`,
);
var _tmpl$102 = template(`<div>Loader Data`);
var _tmpl$11 = template(`<div><div>Search Params</div><div>`);
function Logo(props) {
   const {
      className: className$1,
      ...rest
   } = props;
   const styles = useStyles();
   return (() => {
      var _el$ = _tmpl$10(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
      spread(
         _el$,
         mergeProps(rest, {
            get ['class']() {
               return clsx(styles().logo, className$1 ? className$1() : '');
            },
         }),
         false,
         true,
      );
      createRenderEffect((_p$) => {
         var _v$ = styles().tanstackLogo, _v$2 = styles().routerLogo;
         _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
         _v$2 !== _p$.t && className(_el$3, _p$.t = _v$2);
         return _p$;
      }, {
         e: void 0,
         t: void 0,
      });
      return _el$;
   })();
}
function NavigateLink(props) {
   return (() => {
      var _el$4 = _tmpl$22(), _el$5 = _el$4.firstChild;
      _el$4.style.setProperty('display', 'flex');
      _el$4.style.setProperty('align-items', 'center');
      _el$4.style.setProperty('width', '100%');
      insert(_el$4, () => props.left, _el$5);
      _el$5.style.setProperty('flex-grow', '1');
      _el$5.style.setProperty('min-width', '0');
      insert(_el$5, () => props.children);
      insert(_el$4, () => props.right, null);
      createRenderEffect(() => className(_el$4, props.class));
      return _el$4;
   })();
}
function RouteComp({
   routerState,
   router,
   route,
   isRoot,
   activeId,
   setActiveId,
}) {
   const styles = useStyles();
   const matches = createMemo(() => routerState().pendingMatches || routerState().matches);
   const match = createMemo(() => routerState().matches.find((d) => d.routeId === route.id));
   const param = createMemo(() => {
      var _a, _b;
      try {
         if ((_a = match()) == null ? void 0 : _a.params) {
            const p2 = (_b = match()) == null ? void 0 : _b.params;
            const r2 = route.path || trimPath(route.id);
            if (r2.startsWith('$')) {
               const trimmed = r2.slice(1);
               if (p2[trimmed]) {
                  return `(${p2[trimmed]})`;
               }
            }
         }
         return '';
      } catch (error) {
         return '';
      }
   });
   const navigationTarget = createMemo(() => {
      if (isRoot) return void 0;
      if (!route.path) return void 0;
      const allParams = Object.assign({}, ...matches().map((m) => m.params));
      const interpolated = interpolatePath({
         path: route.fullPath,
         params: allParams,
         leaveWildcards: false,
         leaveParams: false,
         decodeCharMap: router().pathParamsDecodeCharMap,
      });
      return !interpolated.isMissingParams ? interpolated.interpolatedPath : void 0;
   });
   return (() => {
      var _el$6 = _tmpl$52(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild;
      _el$7.$$click = () => {
         if (match()) {
            setActiveId(activeId() === route.id ? '' : route.id);
         }
      };
      insert(
         _el$7,
         createComponent(NavigateLink, {
            get ['class']() {
               return clsx(styles().routesRow(!!match()));
            },
            get left() {
               return createComponent(Show, {
                  get when() {
                     return navigationTarget();
                  },
                  children: (navigate) =>
                     createComponent(NavigateButton, {
                        get to() {
                           return navigate();
                        },
                        router,
                     }),
               });
            },
            get right() {
               return createComponent(AgeTicker, {
                  get match() {
                     return match();
                  },
                  router,
               });
            },
            get children() {
               return [
                  (() => {
                     var _el$9 = _tmpl$32(), _el$0 = _el$9.firstChild;
                     insert(
                        _el$9,
                        () => isRoot ? rootRouteId : route.path || trimPath(route.id),
                        _el$0,
                     );
                     createRenderEffect(() => className(_el$9, styles().code));
                     return _el$9;
                  })(),
                  (() => {
                     var _el$1 = _tmpl$42();
                     insert(_el$1, param);
                     createRenderEffect(() => className(_el$1, styles().routeParamInfo));
                     return _el$1;
                  })(),
               ];
            },
         }),
         null,
      );
      insert(
         _el$6,
         (() => {
            var _c$ = memo(() => {
               var _a;
               return !!((_a = route.children) == null ? void 0 : _a.length);
            });
            return () =>
               _c$()
                  ? (() => {
                     var _el$10 = _tmpl$62();
                     insert(_el$10, () =>
                        [...route.children].sort((a2, b2) => {
                           return a2.rank - b2.rank;
                        }).map((r2) =>
                           createComponent(RouteComp, {
                              routerState,
                              router,
                              route: r2,
                              activeId,
                              setActiveId,
                           })
                        ));
                     createRenderEffect(() => className(_el$10, styles().nestedRouteRow(!!isRoot)));
                     return _el$10;
                  })()
                  : null;
         })(),
         null,
      );
      createRenderEffect((_p$) => {
         var _v$3 = `Open match details for ${route.id}`,
            _v$4 = clsx(styles().routesRowContainer(route.id === activeId(), !!match())),
            _v$5 = clsx(styles().matchIndicator(getRouteStatusColor(matches(), route)));
         _v$3 !== _p$.e && setAttribute(_el$7, 'aria-label', _p$.e = _v$3);
         _v$4 !== _p$.t && className(_el$7, _p$.t = _v$4);
         _v$5 !== _p$.a && className(_el$8, _p$.a = _v$5);
         return _p$;
      }, {
         e: void 0,
         t: void 0,
         a: void 0,
      });
      return _el$6;
   })();
}
var BaseTanStackRouterDevtoolsPanel = function BaseTanStackRouterDevtoolsPanel2({
   ...props
}) {
   const {
      isOpen = true,
      setIsOpen,
      handleDragStart,
      router,
      routerState,
      shadowDOMTarget,
      ...panelProps
   } = props;
   const {
      onCloseClick,
   } = useDevtoolsOnClose();
   const styles = useStyles();
   const {
      className: className$1,
      style,
      ...otherPanelProps
   } = panelProps;
   invariant(
      router,
      'No router was found for the TanStack Router Devtools. Please place the devtools in the <RouterProvider> component tree or pass the router instance to the devtools manually.',
   );
   const [showMatches, setShowMatches] = useLocalStorage('tanstackRouterDevtoolsShowMatches', true);
   const [activeId, setActiveId] = useLocalStorage('tanstackRouterDevtoolsActiveRouteId', '');
   const activeMatch = createMemo(() => {
      const matches = [
         ...routerState().pendingMatches ?? [],
         ...routerState().matches,
         ...routerState().cachedMatches,
      ];
      return matches.find((d) => d.routeId === activeId() || d.id === activeId());
   });
   const hasSearch = createMemo(() => Object.keys(routerState().location.search).length);
   const explorerState = createMemo(() => {
      return {
         ...router(),
         state: routerState(),
      };
   });
   const routerExplorerValue = createMemo(() =>
      Object.fromEntries(
         multiSortBy(
            Object.keys(explorerState()),
            ['state', 'routesById', 'routesByPath', 'flatRoutes', 'options', 'manifest'].map(
               (d) => (dd) => dd !== d,
            ),
         ).map((key) => [key, explorerState()[key]]).filter((d) =>
            typeof d[1] !== 'function' &&
            ![
               '__store',
               'basepath',
               'injectedHtml',
               'subscribers',
               'latestLoadPromise',
               'navigateTimeout',
               'resetNextScroll',
               'tempLocationKey',
               'latestLocation',
               'routeTree',
               'history',
            ].includes(d[0])
         ),
      )
   );
   const activeMatchLoaderData = createMemo(() => {
      var _a;
      return (_a = activeMatch()) == null ? void 0 : _a.loaderData;
   });
   const activeMatchValue = createMemo(() => activeMatch());
   const locationSearchValue = createMemo(() => routerState().location.search);
   return (() => {
      var _el$11 = _tmpl$72(),
         _el$12 = _el$11.firstChild,
         _el$13 = _el$12.firstChild,
         _el$14 = _el$12.nextSibling,
         _el$15 = _el$14.firstChild,
         _el$16 = _el$15.nextSibling,
         _el$17 = _el$16.firstChild,
         _el$18 = _el$14.nextSibling,
         _el$19 = _el$18.firstChild,
         _el$20 = _el$19.firstChild;
      _el$20.firstChild;
      var _el$22 = _el$20.nextSibling,
         _el$23 = _el$22.firstChild,
         _el$24 = _el$22.nextSibling,
         _el$25 = _el$24.firstChild,
         _el$26 = _el$25.firstChild,
         _el$27 = _el$26.nextSibling,
         _el$28 = _el$25.nextSibling,
         _el$29 = _el$24.nextSibling;
      spread(
         _el$11,
         mergeProps({
            get ['class']() {
               return clsx(
                  styles().devtoolsPanel,
                  'TanStackRouterDevtoolsPanel',
                  className$1 ? className$1() : '',
               );
            },
            get style() {
               return style ? style() : '';
            },
         }, otherPanelProps),
         false,
         true,
      );
      insert(
         _el$11,
         handleDragStart
            ? (() => {
               var _el$30 = _tmpl$62();
               addEventListener(_el$30, 'mousedown', handleDragStart, true);
               createRenderEffect(() => className(_el$30, styles().dragHandle));
               return _el$30;
            })()
            : null,
         _el$12,
      );
      _el$12.$$click = (e2) => {
         if (setIsOpen) {
            setIsOpen(false);
         }
         onCloseClick(e2);
      };
      insert(
         _el$15,
         createComponent(Logo, {
            'aria-hidden': true,
            onClick: (e2) => {
               if (setIsOpen) {
                  setIsOpen(false);
               }
               onCloseClick(e2);
            },
         }),
      );
      insert(
         _el$17,
         createComponent(Explorer, {
            label: 'Router',
            value: routerExplorerValue,
            defaultExpanded: {
               state: {},
               context: {},
               options: {},
            },
            filterSubEntries: (subEntries) => {
               return subEntries.filter((d) => typeof d.value() !== 'function');
            },
         }),
      );
      insert(
         _el$20,
         (() => {
            var _c$2 = memo(() => !!routerState().location.maskedLocation);
            return () =>
               _c$2()
                  ? (() => {
                     var _el$31 = _tmpl$82(), _el$32 = _el$31.firstChild;
                     createRenderEffect((_p$) => {
                        var _v$22 = styles().maskedBadgeContainer, _v$23 = styles().maskedBadge;
                        _v$22 !== _p$.e && className(_el$31, _p$.e = _v$22);
                        _v$23 !== _p$.t && className(_el$32, _p$.t = _v$23);
                        return _p$;
                     }, {
                        e: void 0,
                        t: void 0,
                     });
                     return _el$31;
                  })()
                  : null;
         })(),
         null,
      );
      insert(_el$23, () => routerState().location.pathname);
      insert(
         _el$22,
         (() => {
            var _c$3 = memo(() => !!routerState().location.maskedLocation);
            return () =>
               _c$3()
                  ? (() => {
                     var _el$33 = _tmpl$42();
                     insert(_el$33, () => {
                        var _a;
                        return (_a = routerState().location.maskedLocation) == null
                           ? void 0
                           : _a.pathname;
                     });
                     createRenderEffect(() => className(_el$33, styles().maskedLocation));
                     return _el$33;
                  })()
                  : null;
         })(),
         null,
      );
      _el$26.$$click = () => {
         setShowMatches(false);
      };
      _el$27.$$click = () => {
         setShowMatches(true);
      };
      insert(
         _el$29,
         (() => {
            var _c$4 = memo(() => !!!showMatches());
            return () =>
               _c$4()
                  ? createComponent(RouteComp, {
                     routerState,
                     router,
                     get route() {
                        return router().routeTree;
                     },
                     isRoot: true,
                     activeId,
                     setActiveId,
                  })
                  : (() => {
                     var _el$34 = _tmpl$62();
                     insert(_el$34, () => {
                        var _a, _b;
                        return (_b =
                              ((_a = routerState().pendingMatches) == null ? void 0 : _a.length)
                                 ? routerState().pendingMatches
                                 : routerState().matches) == null
                           ? void 0
                           : _b.map((match, _i) => {
                              return (() => {
                                 var _el$35 = _tmpl$92(), _el$36 = _el$35.firstChild;
                                 _el$35.$$click = () =>
                                    setActiveId(activeId() === match.id ? '' : match.id);
                                 insert(
                                    _el$35,
                                    createComponent(NavigateLink, {
                                       get left() {
                                          return createComponent(NavigateButton, {
                                             get to() {
                                                return match.pathname;
                                             },
                                             get params() {
                                                return match.params;
                                             },
                                             get search() {
                                                return match.search;
                                             },
                                             router,
                                          });
                                       },
                                       get right() {
                                          return createComponent(AgeTicker, {
                                             match,
                                             router,
                                          });
                                       },
                                       get children() {
                                          var _el$37 = _tmpl$42();
                                          insert(_el$37, () =>
                                             `${
                                                match.routeId === rootRouteId
                                                   ? rootRouteId
                                                   : match.pathname
                                             }`);
                                          createRenderEffect(() =>
                                             className(_el$37, styles().matchID)
                                          );
                                          return _el$37;
                                       },
                                    }),
                                    null,
                                 );
                                 createRenderEffect((_p$) => {
                                    var _v$24 = `Open match details for ${match.id}`,
                                       _v$25 = clsx(styles().matchRow(match === activeMatch())),
                                       _v$26 = clsx(styles().matchIndicator(getStatusColor(match)));
                                    _v$24 !== _p$.e &&
                                       setAttribute(_el$35, 'aria-label', _p$.e = _v$24);
                                    _v$25 !== _p$.t && className(_el$35, _p$.t = _v$25);
                                    _v$26 !== _p$.a && className(_el$36, _p$.a = _v$26);
                                    return _p$;
                                 }, {
                                    e: void 0,
                                    t: void 0,
                                    a: void 0,
                                 });
                                 return _el$35;
                              })();
                           });
                     });
                     return _el$34;
                  })();
         })(),
      );
      insert(
         _el$18,
         (() => {
            var _c$5 = memo(() => !!routerState().cachedMatches.length);
            return () =>
               _c$5()
                  ? (() => {
                     var _el$38 = _tmpl$0(),
                        _el$39 = _el$38.firstChild,
                        _el$40 = _el$39.firstChild,
                        _el$41 = _el$40.nextSibling,
                        _el$42 = _el$39.nextSibling;
                     insert(_el$42, () =>
                        routerState().cachedMatches.map((match) => {
                           return (() => {
                              var _el$43 = _tmpl$92(), _el$44 = _el$43.firstChild;
                              _el$43.$$click = () =>
                                 setActiveId(activeId() === match.id ? '' : match.id);
                              insert(
                                 _el$43,
                                 createComponent(NavigateLink, {
                                    get left() {
                                       return createComponent(NavigateButton, {
                                          get to() {
                                             return match.pathname;
                                          },
                                          get params() {
                                             return match.params;
                                          },
                                          get search() {
                                             return match.search;
                                          },
                                          router,
                                       });
                                    },
                                    get right() {
                                       return createComponent(AgeTicker, {
                                          match,
                                          router,
                                       });
                                    },
                                    get children() {
                                       var _el$45 = _tmpl$42();
                                       insert(_el$45, () => `${match.id}`);
                                       createRenderEffect(() =>
                                          className(_el$45, styles().matchID)
                                       );
                                       return _el$45;
                                    },
                                 }),
                                 null,
                              );
                              createRenderEffect((_p$) => {
                                 var _v$30 = `Open match details for ${match.id}`,
                                    _v$31 = clsx(styles().matchRow(match === activeMatch())),
                                    _v$32 = clsx(styles().matchIndicator(getStatusColor(match)));
                                 _v$30 !== _p$.e &&
                                    setAttribute(_el$43, 'aria-label', _p$.e = _v$30);
                                 _v$31 !== _p$.t && className(_el$43, _p$.t = _v$31);
                                 _v$32 !== _p$.a && className(_el$44, _p$.a = _v$32);
                                 return _p$;
                              }, {
                                 e: void 0,
                                 t: void 0,
                                 a: void 0,
                              });
                              return _el$43;
                           })();
                        }));
                     createRenderEffect((_p$) => {
                        var _v$27 = styles().cachedMatchesContainer,
                           _v$28 = styles().detailsHeader,
                           _v$29 = styles().detailsHeaderInfo;
                        _v$27 !== _p$.e && className(_el$38, _p$.e = _v$27);
                        _v$28 !== _p$.t && className(_el$39, _p$.t = _v$28);
                        _v$29 !== _p$.a && className(_el$41, _p$.a = _v$29);
                        return _p$;
                     }, {
                        e: void 0,
                        t: void 0,
                        a: void 0,
                     });
                     return _el$38;
                  })()
                  : null;
         })(),
         null,
      );
      insert(
         _el$11,
         (() => {
            var _c$6 = memo(() => {
               var _a;
               return !!(activeMatch() && ((_a = activeMatch()) == null ? void 0 : _a.status));
            });
            return () =>
               _c$6()
                  ? (() => {
                     var _el$46 = _tmpl$1(),
                        _el$47 = _el$46.firstChild,
                        _el$48 = _el$47.nextSibling,
                        _el$49 = _el$48.firstChild,
                        _el$50 = _el$49.firstChild,
                        _el$51 = _el$50.firstChild,
                        _el$52 = _el$50.nextSibling,
                        _el$53 = _el$52.firstChild,
                        _el$54 = _el$53.nextSibling,
                        _el$55 = _el$54.firstChild,
                        _el$56 = _el$52.nextSibling,
                        _el$57 = _el$56.firstChild,
                        _el$58 = _el$57.nextSibling,
                        _el$59 = _el$56.nextSibling,
                        _el$60 = _el$59.firstChild,
                        _el$61 = _el$60.nextSibling,
                        _el$62 = _el$48.nextSibling,
                        _el$63 = _el$62.nextSibling;
                     insert(
                        _el$51,
                        (() => {
                           var _c$8 = memo(() => {
                              var _a, _b;
                              return !!(((_a = activeMatch()) == null ? void 0 : _a.status) ===
                                    'success' &&
                                 ((_b = activeMatch()) == null ? void 0 : _b.isFetching));
                           });
                           return () => {
                              var _a;
                              return _c$8()
                                 ? 'fetching'
                                 : (_a = activeMatch()) == null
                                 ? void 0
                                 : _a.status;
                           };
                        })(),
                     );
                     insert(_el$55, () => {
                        var _a;
                        return (_a = activeMatch()) == null ? void 0 : _a.id;
                     });
                     insert(
                        _el$58,
                        (() => {
                           var _c$9 = memo(() => {
                              var _a;
                              return !!((_a = routerState().pendingMatches) == null
                                 ? void 0
                                 : _a.find((d) => {
                                    var _a2;
                                    return d.id ===
                                       ((_a2 = activeMatch()) == null ? void 0 : _a2.id);
                                 }));
                           });
                           return () =>
                              _c$9() ? 'Pending' : routerState().matches.find((d) => {
                                    var _a;
                                    return d.id === ((_a = activeMatch()) == null ? void 0 : _a.id);
                                 })
                                 ? 'Active'
                                 : 'Cached';
                        })(),
                     );
                     insert(
                        _el$61,
                        (() => {
                           var _c$0 = memo(() => {
                              var _a;
                              return !!((_a = activeMatch()) == null ? void 0 : _a.updatedAt);
                           });
                           return () => {
                              var _a;
                              return _c$0()
                                 ? new Date((_a = activeMatch()) == null ? void 0 : _a.updatedAt)
                                    .toLocaleTimeString()
                                 : 'N/A';
                           };
                        })(),
                     );
                     insert(
                        _el$46,
                        (() => {
                           var _c$1 = memo(() => !!activeMatchLoaderData());
                           return () =>
                              _c$1()
                                 ? [
                                    (() => {
                                       var _el$64 = _tmpl$102();
                                       createRenderEffect(() =>
                                          className(_el$64, styles().detailsHeader)
                                       );
                                       return _el$64;
                                    })(),
                                    (() => {
                                       var _el$65 = _tmpl$62();
                                       insert(
                                          _el$65,
                                          createComponent(Explorer, {
                                             label: 'loaderData',
                                             value: activeMatchLoaderData,
                                             defaultExpanded: {},
                                          }),
                                       );
                                       createRenderEffect(() =>
                                          className(_el$65, styles().detailsContent)
                                       );
                                       return _el$65;
                                    })(),
                                 ]
                                 : null;
                        })(),
                        _el$62,
                     );
                     insert(
                        _el$63,
                        createComponent(Explorer, {
                           label: 'Match',
                           value: activeMatchValue,
                           defaultExpanded: {},
                        }),
                     );
                     createRenderEffect((_p$) => {
                        var _a, _b;
                        var _v$33 = styles().thirdContainer,
                           _v$34 = styles().detailsHeader,
                           _v$35 = styles().matchDetails,
                           _v$36 = styles().matchStatus(
                              (_a = activeMatch()) == null ? void 0 : _a.status,
                              (_b = activeMatch()) == null ? void 0 : _b.isFetching,
                           ),
                           _v$37 = styles().matchDetailsInfoLabel,
                           _v$38 = styles().matchDetailsInfo,
                           _v$39 = styles().matchDetailsInfoLabel,
                           _v$40 = styles().matchDetailsInfo,
                           _v$41 = styles().matchDetailsInfoLabel,
                           _v$42 = styles().matchDetailsInfo,
                           _v$43 = styles().detailsHeader,
                           _v$44 = styles().detailsContent;
                        _v$33 !== _p$.e && className(_el$46, _p$.e = _v$33);
                        _v$34 !== _p$.t && className(_el$47, _p$.t = _v$34);
                        _v$35 !== _p$.a && className(_el$49, _p$.a = _v$35);
                        _v$36 !== _p$.o && className(_el$50, _p$.o = _v$36);
                        _v$37 !== _p$.i && className(_el$52, _p$.i = _v$37);
                        _v$38 !== _p$.n && className(_el$54, _p$.n = _v$38);
                        _v$39 !== _p$.s && className(_el$56, _p$.s = _v$39);
                        _v$40 !== _p$.h && className(_el$58, _p$.h = _v$40);
                        _v$41 !== _p$.r && className(_el$59, _p$.r = _v$41);
                        _v$42 !== _p$.d && className(_el$61, _p$.d = _v$42);
                        _v$43 !== _p$.l && className(_el$62, _p$.l = _v$43);
                        _v$44 !== _p$.u && className(_el$63, _p$.u = _v$44);
                        return _p$;
                     }, {
                        e: void 0,
                        t: void 0,
                        a: void 0,
                        o: void 0,
                        i: void 0,
                        n: void 0,
                        s: void 0,
                        h: void 0,
                        r: void 0,
                        d: void 0,
                        l: void 0,
                        u: void 0,
                     });
                     return _el$46;
                  })()
                  : null;
         })(),
         null,
      );
      insert(
         _el$11,
         (() => {
            var _c$7 = memo(() => !!hasSearch());
            return () =>
               _c$7()
                  ? (() => {
                     var _el$66 = _tmpl$11(),
                        _el$67 = _el$66.firstChild,
                        _el$68 = _el$67.nextSibling;
                     insert(
                        _el$68,
                        createComponent(Explorer, {
                           value: locationSearchValue,
                           get defaultExpanded() {
                              return Object.keys(routerState().location.search).reduce(
                                 (obj, next) => {
                                    obj[next] = {};
                                    return obj;
                                 },
                                 {},
                              );
                           },
                        }),
                     );
                     createRenderEffect((_p$) => {
                        var _v$45 = styles().fourthContainer,
                           _v$46 = styles().detailsHeader,
                           _v$47 = styles().detailsContent;
                        _v$45 !== _p$.e && className(_el$66, _p$.e = _v$45);
                        _v$46 !== _p$.t && className(_el$67, _p$.t = _v$46);
                        _v$47 !== _p$.a && className(_el$68, _p$.a = _v$47);
                        return _p$;
                     }, {
                        e: void 0,
                        t: void 0,
                        a: void 0,
                     });
                     return _el$66;
                  })()
                  : null;
         })(),
         null,
      );
      createRenderEffect((_p$) => {
         var _v$6 = styles().panelCloseBtn,
            _v$7 = styles().panelCloseBtnIcon,
            _v$8 = styles().firstContainer,
            _v$9 = styles().row,
            _v$0 = styles().routerExplorerContainer,
            _v$1 = styles().routerExplorer,
            _v$10 = styles().secondContainer,
            _v$11 = styles().matchesContainer,
            _v$12 = styles().detailsHeader,
            _v$13 = styles().detailsContent,
            _v$14 = styles().detailsHeader,
            _v$15 = styles().routeMatchesToggle,
            _v$16 = !showMatches(),
            _v$17 = clsx(styles().routeMatchesToggleBtn(!showMatches(), true)),
            _v$18 = showMatches(),
            _v$19 = clsx(styles().routeMatchesToggleBtn(!!showMatches(), false)),
            _v$20 = styles().detailsHeaderInfo,
            _v$21 = clsx(styles().routesContainer);
         _v$6 !== _p$.e && className(_el$12, _p$.e = _v$6);
         _v$7 !== _p$.t && setAttribute(_el$13, 'class', _p$.t = _v$7);
         _v$8 !== _p$.a && className(_el$14, _p$.a = _v$8);
         _v$9 !== _p$.o && className(_el$15, _p$.o = _v$9);
         _v$0 !== _p$.i && className(_el$16, _p$.i = _v$0);
         _v$1 !== _p$.n && className(_el$17, _p$.n = _v$1);
         _v$10 !== _p$.s && className(_el$18, _p$.s = _v$10);
         _v$11 !== _p$.h && className(_el$19, _p$.h = _v$11);
         _v$12 !== _p$.r && className(_el$20, _p$.r = _v$12);
         _v$13 !== _p$.d && className(_el$22, _p$.d = _v$13);
         _v$14 !== _p$.l && className(_el$24, _p$.l = _v$14);
         _v$15 !== _p$.u && className(_el$25, _p$.u = _v$15);
         _v$16 !== _p$.c && (_el$26.disabled = _p$.c = _v$16);
         _v$17 !== _p$.w && className(_el$26, _p$.w = _v$17);
         _v$18 !== _p$.m && (_el$27.disabled = _p$.m = _v$18);
         _v$19 !== _p$.f && className(_el$27, _p$.f = _v$19);
         _v$20 !== _p$.y && className(_el$28, _p$.y = _v$20);
         _v$21 !== _p$.g && className(_el$29, _p$.g = _v$21);
         return _p$;
      }, {
         e: void 0,
         t: void 0,
         a: void 0,
         o: void 0,
         i: void 0,
         n: void 0,
         s: void 0,
         h: void 0,
         r: void 0,
         d: void 0,
         l: void 0,
         u: void 0,
         c: void 0,
         w: void 0,
         m: void 0,
         f: void 0,
         y: void 0,
         g: void 0,
      });
      return _el$11;
   })();
};
delegateEvents(['click', 'mousedown']);

export { BaseTanStackRouterDevtoolsPanel, clsx, useIsMounted, useLocalStorage, useStyles };
//# sourceMappingURL=chunk-J56NN4R3.js.map
