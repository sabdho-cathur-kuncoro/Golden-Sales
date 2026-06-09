# DESIGN.md

Design-system reference for Golden Sales. All tokens live in `src/constants/theme.ts` (`@/constants/theme`) — import from there, never hardcode hex/spacing/fonts in screens.

## Typography

Custom font family **Satoshi**, loaded in `src/app/_layout.tsx` via `expo-font` under these keys:

```
FontFamily.satoshiRegular | satoshiLight | satoshiMedium | satoshiBold
```

Use `FontFamily.xxx` in `fontFamily`. Prebuilt `{ fontFamily, color }` style objects pair a weight with a semantic color — spread into `style={[...]}`:

| Style object | Color |
|---|---|
| `primaryTextStyle` | `primaryColor` |
| `whiteTextStyle` | `whiteColor` |
| `blackTextStyle` | `blackColor` |
| `greyTextStyle` | `greyColor` |
| `inactiveTextStyle` | `inactiveColor` |
| `redTextStyle` / `greenTextStyle` / `yellowTextStyle` / `orangeTextStyle` / `blueTextStyle` / `purpleTextStyle` / `greenSecTextStyle` | matching semantic color |

All default to `satoshiRegular`; override with `fontFamily: FontFamily.satoshiBold` etc. when combining (e.g. labels use `satoshiBold` at `fontSize: 12`).

## Color palette

**Brand**
`primaryColor` `#1C0867` · `secondaryColor` `#B0A8BA` · `darkBlueColor` `#0D042F`

**Backgrounds / surfaces**
`bgColor` `#F2F3F5` (screen bg) · `bgSecondaryColor` `#F4F1FE` · `bgTertiaryColor` `#F0ECFE` · `whiteColor`/`whiteSecondaryColor`/`whiteThirdColor`

**Neutrals / text**
`blackColor` `#202020` · `greyColor` `#6C7278` · `greySecondaryColor`/`greyTertiaryColor` · `inactiveColor` (disabled/inactive tab state)

**Semantic / status** — each has a base + RGBA/secondary/stroke variant for fills, badges, borders:
- success: `greenColor` `#0DB561` (+ `greenSecondaryColor`, `greenRGBAColor`, `greenSecondaryRGBAColor`)
- danger: `redColor` `#FD131F` (+ `redRGBAColor`, `redStrokeColor`)
- warning: `yellowColor` `#FFB34A` (+ `yellowSecondaryColor`)
- info/links: `blueColor` `#003E97` (+ `blueRGBAColor`, `blueSecondaryColor`, `blueStrokeColor`, `lightBlueColor`)
- `orangeColor`/`orangeSecondaryColor`/`orangeRGBAColor`/`orangeStrokeColor`, `purpleColor`/`purpleRGBAColor`/`purpleStrokeColor`, `pinkColor`/`pinkSecondaryColor`

**Structural**
`strokeColor` `#CCD7EB` (card/icon borders) · `lineColor` `#D4D7DE` (dividers) · `borderColor` `#B2C2FF` · `borderInputColor` `#EDF1F3` (form inputs) · `tabBarColor`/`inactiveColor` (tab bar)

`useToast()` maps these to toast variants: success→green, error→red, warning→yellow, info→blue (see `src/hooks/useToast.ts` for the exact gradient pairs).

## Spacing

`SPACE_4 SPACE_8 SPACE_16 SPACE_24 SPACE_32 SPACE_48 SPACE_64` (numeric px values, 4-based scale). Use these instead of magic numbers in margin/padding/gap.

## Shared layout/style objects

Spread these into `StyleSheet.create` entries for common layout shapes:

| Object | Purpose |
|---|---|
| `mainContent` | `{ flex:1, backgroundColor: bgColor }` — generic screen content wrapper |
| `screen` | `mainContent` + `paddingTop: 48` |
| `paddingScroll` | scroll content padding (`paddingTop:20, paddingBottom:120, paddingHorizontal: SPACE_16`) — leaves room for floating footer/tab bar |
| `footerStyle` | absolute-bottom footer container (full width, centered, `minHeight: 96`) |
| `paddingH` | `paddingHorizontal: SPACE_16` |
| `rowCenter` | `{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }` |
| `shadow` | standard elevation/shadow for cards (`shadowColor: blackColor`, elevation 10) |
| `line` / `lineDash` | 1px solid / dashed horizontal divider in `lineColor` |
| `dot` | small 6×6 circular badge dot, default `redColor` (used for notif indicators) |
| `BottomTabInset` | platform-specific bottom inset (`ios: 50, android: 80`) |
| `MaxContentWidth` | `800` — cap content width on wide/web layouts |

`Colors.light` / `Colors.dark` exist (Expo template defaults for `text`/`background`/`backgroundElement`/`backgroundSelected`/`textSecondary`) but the app is not using a light/dark theme switch in practice — screens style directly off the constants above.

## Component inventory

### `components/layout`
- **`Screen`** — outer wrapper for every screen: `SafeAreaView` + `flex:1` + `paddingHorizontal:16` + `bgColor` background.

### `components/ui` (barrel: `@/components/ui`)
- **`AnimatedPressable`** — `Pressable` that scales to `0.95` on press-in / back to `1` on press-out via Reanimated (`withTiming`, 100ms). Use as the base for any tappable element that should "press down". `Button` reimplements the same scale pattern internally.
- **`Button`** — primary CTA. Props: `title`, `titleColor`, `bgColor`, `borderColor`, `border`, `radius` (default `10`), `isIconVisible` (appends `ArrowRight` icon), `onPress`. Defaults to filled `primaryColor` pill with white Satoshi-Regular text; pass `bgColor`/`titleColor`/`border` to make outline/secondary variants.
- **`Header`** — screen header bar (white bg, `SPACE_16` padding): back chevron (`onBack`), `title`, optional `isNotifVisible` (bell → `/notifikasi`, with red `dot` badge) and `isIconVisible` (cart → `/cart`).
- **`Gap`** — spacer `View` taking `width`/`height`; use instead of margin for one-off spacing between siblings.
- **`AppBottomSheet`** — single global `@gorhom/bottom-sheet` instance mounted in root layout, controlled via `useBottomSheetStore` (see CLAUDE.md "Global UI" pattern). Handles Android hardware back button.
- **`Toast`** / `ToastItem` — global toast stack mounted in root layout, animated in/out with Reanimated spring/timing + `LinearGradient` background, auto-dismisses after `duration`ms. Driven via `useToast()`.
- **`BannerSlider`** — auto-rotating image carousel for promo banners (home screen).
- **`StatusRow`** — single step in a vertical status/approval timeline: renders `CircleCheck`/`CircleX`/`Circle` (lucide) per step state (`step_done`/`is_reject`/`current_step`) with connecting line; used for approval/order status views.
- **`TileItem`**, **`TileCart`**, **`TileOrder`**, **`TileNotif`**, **`TileChat`** — card/list-row presentations for catalog products, cart lines, order summaries, notifications, and chat messages respectively. Pull data shape from `src/constants/dummy.ts` until real APIs land.
- **`ChatBubble`** — single chat message bubble (paired with `generateChat` in `utils/helper.ts` for day-grouping).
- **`TransferGuide`** — instructional panel for bank-transfer payment steps (payment screens).

### `components/form` (barrel: `@/components/form`)
- **`FormInput`** — labeled `TextInput`: grey Satoshi-Bold label, bordered input (`borderInputColor`, radius 10, `minHeight: 46`), optional `error` text in `redTextStyle`.
- **`FormPassword`** — same shell as `FormInput` plus a trailing eye/eye-off (`lucide-react-native`) toggle that flips `secureTextEntry` and the placeholder between masked/`placeholderVisible`.

### `components/modal` (barrel: `@/components/modal`)
- **`GlobalConfirmModal`** — confirm/cancel dialog driven by `useConfirmStore`; supports `type: "default" | "danger"` styling and async `onConfirm`.
- **`GlobalInputModal`** — single-text-field prompt dialog driven by `useInputModalStore`; `onConfirm(value)` receives the typed string.

## Icons

Two sources, used side by side:
- **`lucide-react-native`** for generic UI icons (`ArrowRight`, `ChevronLeft`, `Bell`, `Eye`/`EyeOff`, `Circle`/`CircleCheck`/`CircleX`, ...) — pass `size`/`color` from theme constants.
- **Custom SVGs** under `assets/icons/*.svg`, imported as React components via `react-native-svg-transformer` (configured in `metro.config.js`) — used for brand/nav icons (tab bar icons, cart icon in `Header`). Color via the `color` prop, sized via `width`/`height`.

## Conventions when building new UI

- Wrap screens in `Screen`; use `mainContent`/`screen`/`paddingScroll` for content containers and `footerStyle` for sticky bottom action bars.
- Compose styles as `style={[textStyleObject, localStyles.x, { oneOffOverride }]}` — prebuilt style objects first, `StyleSheet.create` for layout, inline only for dynamic one-offs.
- Any new tappable surface should use `AnimatedPressable` (or `Button` for CTAs) to keep the press-scale feedback consistent across the app.
- Reuse the `Tile*` components for list rows where the data shape matches; extend rather than duplicating card markup.
