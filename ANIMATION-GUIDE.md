# Animation Effects Documentation

Comprehensive guide untuk semua animation effects yang tersedia di News Network Platform.

## 📚 Table of Contents

1. [Available Animations](#available-animations)
2. [Usage Examples](#usage-examples)
3. [Layout-Specific Animations](#layout-specific-animations)
4. [Performance Best Practices](#performance-best-practices)
5. [Customization](#customization)

---

## 🎨 Available Animations

### Fade Animations

#### `animate-fade-in`
- **Duration**: 0.6s
- **Easing**: ease-out
- **Effect**: Element fades in from opacity 0 to 1
- **Use case**: General content reveal

```tsx
<div className="animate-fade-in">Content</div>
```

#### `animate-fade-in-up`
- **Duration**: 0.6s
- **Easing**: ease-out
- **Effect**: Fades in while sliding up 20px
- **Use case**: Cards, article items, bottom sections

```tsx
<div className="animate-fade-in-up">Content slides up</div>
```

#### `animate-fade-in-down`
- **Duration**: 0.6s
- **Easing**: ease-out
- **Effect**: Fades in while sliding down 20px
- **Use case**: Headers, navigation, top sections

```tsx
<h1 className="animate-fade-in-down">Title</h1>
```

#### `animate-fade-in-left`
- **Duration**: 0.6s
- **Easing**: ease-out
- **Effect**: Fades in while sliding from left
- **Use case**: Sidebar content, menu items

```tsx
<div className="animate-fade-in-left">Sidebar content</div>
```

#### `animate-fade-in-right`
- **Duration**: 0.6s
- **Easing**: ease-out
- **Effect**: Fades in while sliding from right
- **Use case**: Right-aligned content

```tsx
<div className="animate-fade-in-right">Right content</div>
```

---

### Slide Animations

#### `animate-slide-in-up`
- **Duration**: 0.5s
- **Easing**: ease-out
- **Effect**: Slides up from bottom (100% translateY)
- **Use case**: Modals, bottom sheets

```tsx
<div className="animate-slide-in-up">Modal content</div>
```

#### `animate-slide-in-down`
- **Duration**: 0.5s
- **Easing**: ease-out
- **Effect**: Slides down from top
- **Use case**: Dropdowns, notifications

```tsx
<div className="animate-slide-in-down">Notification</div>
```

#### `animate-slide-in-left`
- **Duration**: 0.5s
- **Easing**: ease-out
- **Effect**: Slides in from left
- **Use case**: Sidebar menus, drawers

```tsx
<div className="animate-slide-in-left">Drawer</div>
```

#### `animate-slide-in-right`
- **Duration**: 0.5s
- **Easing**: ease-out
- **Effect**: Slides in from right
- **Use case**: Side panels

```tsx
<div className="animate-slide-in-right">Panel</div>
```

---

### Scale Animations

#### `animate-scale-in`
- **Duration**: 0.5s
- **Easing**: ease-out
- **Effect**: Scales from 0.9 to 1 with fade
- **Use case**: Important cards, featured content

```tsx
<div className="animate-scale-in">Featured card</div>
```

#### `animate-scale-up`
- **Duration**: 0.3s
- **Easing**: ease-out
- **Effect**: Quick scale from 0.95 to 1
- **Use case**: Interactive hover effects

```tsx
<div className="hover:animate-scale-up">Hover me</div>
```

#### `animate-bounce-in`
- **Duration**: 0.8s
- **Easing**: ease-out
- **Effect**: Bouncy entrance with overshoot
- **Use case**: Call-to-action, special announcements

```tsx
<button className="animate-bounce-in">Click me!</button>
```

---

### Special Effects

#### `animate-shimmer`
- **Duration**: 2s
- **Easing**: linear
- **Effect**: Infinite shimmer effect
- **Use case**: Loading placeholders, skeleton screens

```tsx
<div className="animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
  Loading...
</div>
```

#### `animate-float`
- **Duration**: 3s
- **Easing**: ease-in-out
- **Effect**: Infinite floating up/down motion
- **Use case**: Icons, decorative elements

```tsx
<div className="animate-float">🎈</div>
```

#### `animate-pulse-slow`
- **Duration**: 3s
- **Easing**: cubic-bezier(0.4, 0, 0.6, 1)
- **Effect**: Slow infinite pulse (opacity)
- **Use case**: Attention indicators, live badges

```tsx
<div className="animate-pulse-slow">LIVE</div>
```

---

## 💡 Usage Examples

### Staggered Animation (Grid Items)

```tsx
<div className="grid grid-cols-3 gap-4">
  {items.map((item, index) => (
    <div
      key={item.id}
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'both'
      }}
    >
      {item.content}
    </div>
  ))}
</div>
```

### Conditional Animation on Active State

```tsx
<div className={`transition-all duration-700 ${
  isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
}`}>
  Content
</div>
```

### Combined with Hover Effects

```tsx
<div className="animate-fade-in hover:scale-105 hover:shadow-xl transition-all duration-300">
  Hover for effect
</div>
```

---

## 🎯 Layout-Specific Animations

### Magazine Layout
- **Hero**: `animate-fade-in-up`
- **Title**: `animate-fade-in-left`
- **Grid Items**: Staggered `animate-fade-in-up` with 0.1s delay per item

### Hero Carousel Layout
- **Carousel Slides**: Custom opacity + scale transition
- **Carousel Content**: Staggered fade-in (badge → title → excerpt → meta)
- **Delay Pattern**: 0s, 0.2s, 0.3s, 0.4s

### Card Stack Layout
- **Title**: `animate-fade-in-down`
- **Active Card**: `animate-scale-in` on card change
- **Background Cards**: Custom transform with smooth transition

### Timeline Layout
- **Timeline Items**: `animate-fade-in-up`
- **Timeline Dots**: `animate-scale-in`
- **Date Headers**: `animate-fade-in-left`

### Grid News Layout
- **Featured Cards**: `animate-scale-in`
- **Grid Items**: Staggered `animate-fade-in` with opacity delay

---

## ⚡ Performance Best Practices

### DO ✅

1. **Use `transform` and `opacity`** for animations (GPU accelerated)
   ```tsx
   // Good
   <div className="animate-fade-in-up" />
   ```

2. **Use `animationFillMode: 'both'`** for staggered animations
   ```tsx
   style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
   ```

3. **Limit animations on mobile** for better performance
   ```tsx
   <div className="md:animate-fade-in-up">
     Content
   </div>
   ```

### DON'T ❌

1. **Avoid animating `width`, `height`, `left`, `top`** directly
   ```tsx
   // Bad - causes layout reflow
   .animate { width: 100% }

   // Good - use transform
   .animate { transform: scaleX(1) }
   ```

2. **Don't over-animate** - too many animations are distracting
   ```tsx
   // Too much
   <div className="animate-bounce-in animate-float animate-pulse-slow" />
   ```

3. **Don't use long duration on fast interactions**
   ```tsx
   // Bad for button hover
   <button className="animate-bounce-in" />

   // Good
   <button className="transition-transform hover:scale-105" />
   ```

---

## 🎨 Customization

### Creating Custom Durations

```tsx
<div className="animate-fade-in" style={{ animationDuration: '1.5s' }}>
  Slower fade in
</div>
```

### Creating Custom Delays

```tsx
<div className="animate-scale-in" style={{ animationDelay: '500ms' }}>
  Delayed entrance
</div>
```

### Combining Multiple Animations

```tsx
<div className="animate-fade-in-up hover:animate-float">
  Combined effects
</div>
```

### Custom Animation in Tailwind Config

To add your own animations, edit `tailwind.config.ts`:

```typescript
keyframes: {
  "my-custom-animation": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
},
animation: {
  "my-custom": "my-custom-animation 1s ease-in-out infinite",
},
```

Then use:
```tsx
<div className="animate-my-custom">Spinning content</div>
```

---

## 🔧 Debugging Animations

### Check if Animation is Running

Use browser DevTools:
1. Open Chrome DevTools
2. Go to "Animations" tab
3. Trigger animation
4. Inspect timeline and properties

### Slow Down Animations for Testing

```tsx
// Temporarily slow down all animations
<div className="animate-fade-in" style={{ animationDuration: '5s' }}>
  Slow motion for debugging
</div>
```

---

## 📊 Animation Performance Monitor

Monitor animation performance:

```javascript
// In browser console
performance.mark('animation-start');
// ... animation happens
performance.mark('animation-end');
performance.measure('animation', 'animation-start', 'animation-end');
console.log(performance.getEntriesByName('animation'));
```

---

## 🎬 Animation Showcase

### Example: News Article Reveal

```tsx
<article className="space-y-4">
  <div className="animate-fade-in-down">
    <Badge>Category</Badge>
  </div>
  <h1 className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
    Article Title
  </h1>
  <p className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
    Article excerpt...
  </p>
  <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
    <img src="..." alt="..." />
  </div>
</article>
```

---

## 📝 Summary

**Total Animations Available**: 15

- ✅ Fade animations: 5
- ✅ Slide animations: 4
- ✅ Scale animations: 3
- ✅ Special effects: 3

All animations are optimized for:
- ⚡ GPU acceleration
- 📱 Mobile performance
- ♿ Accessibility
- 🎯 User experience

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
