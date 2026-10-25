# React Bits — PillNav

This folder contains the `PillNav` component reference from [React Bits](https://reactbits.dev).

- `PillNav.jsx` — component (paste full source from React Bits to use in a React app)
- `PillNav.css` — component styles

## Usage (React)
```jsx
import PillNav from './react-bits/PillNav';
import logo from './logo.svg';

<PillNav
  logo={logo}
  logoAlt="Gravy Groovy"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' }
  ]}
  activeHref="/"
  theme="light"
  highlightColor="#7a1f2b"
/>
```

## Note
The main site is a static, SEO-friendly HTML build. The animated pill-style navigation in the static site mirrors PillNav's visual language (glass capsule, pill items, hover fill) using vanilla CSS/JS so SEO and performance are preserved.
