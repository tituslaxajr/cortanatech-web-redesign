/* @ds-bundle: {"format":3,"namespace":"CortanaTechDesignSystem_bb1f31","components":[{"name":"BlogCard","sourcePath":"components/cards/BlogCard.jsx"},{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"TeamCard","sourcePath":"components/cards/TeamCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"ServiceItem","sourcePath":"components/core/ServiceItem.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Navbar","sourcePath":"components/navigation/Navbar.jsx"}],"sourceHashes":{"components/cards/BlogCard.jsx":"bfcea7666a4b","components/cards/Card.jsx":"73013bc23fb2","components/cards/TeamCard.jsx":"b791307775e7","components/core/Badge.jsx":"bae80b64e06d","components/core/Button.jsx":"31bb8696899e","components/core/SectionHeader.jsx":"1b29743897c1","components/core/ServiceItem.jsx":"339d4e8c26c8","components/forms/Input.jsx":"4264ce6e459b","components/navigation/Navbar.jsx":"abacf5253951"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CortanaTechDesignSystem_bb1f31 = window.CortanaTechDesignSystem_bb1f31 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/BlogCard.jsx
try { (() => {
function BlogCard({
  date,
  title,
  excerpt,
  href = '#',
  category
}) {
  const [hovered, setHovered] = React.useState(false);
  return React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '20px 22px',
      boxShadow: hovered ? 'var(--shadow-card-hover, 0 6px 20px rgba(28,117,188,0.12))' : 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.06))',
      transition: 'all 0.2s ease',
      transform: hovered ? 'translateY(-2px)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, date && React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--color-text-muted, #8C909A)',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)'
    }
  }, date), React.createElement('h3', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display, "Urbanist", sans-serif)',
      fontSize: '18px',
      fontWeight: '700',
      color: 'var(--color-primary-dark, #2B3990)',
      lineHeight: '1.35',
      letterSpacing: '-0.01em'
    }
  }, title), excerpt && React.createElement('p', {
    style: {
      margin: 0,
      fontSize: '14px',
      color: 'var(--color-text-secondary, #454C59)',
      lineHeight: '1.6',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, excerpt), React.createElement('a', {
    href,
    style: {
      marginTop: '4px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-primary, #1C75BC)',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, 'Learn more →'));
}
Object.assign(__ds_scope, { BlogCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/BlogCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/Card.jsx
try { (() => {
function Card({
  hoverable = false,
  flush = false,
  children,
  style = {}
}) {
  const [hovered, setHovered] = React.useState(false);
  const cardStyle = {
    background: 'var(--color-surface-default, #fff)',
    borderRadius: 'var(--radius-lg, 12px)',
    boxShadow: hovered && hoverable ? 'var(--shadow-card-hover, 0 6px 20px rgba(28,117,188,0.12), 0 2px 8px rgba(0,0,0,0.06))' : 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04))',
    padding: flush ? '0' : 'var(--space-6, 24px)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    transform: hovered && hoverable ? 'translateY(-2px)' : 'translateY(0)',
    overflow: 'hidden',
    ...style
  };
  return React.createElement('div', {
    style: cardStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/cards/TeamCard.jsx
try { (() => {
function TeamCard({
  name,
  role,
  bio,
  avatarSrc
}) {
  return React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-xl, 16px)',
      padding: '20px',
      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.06))',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, React.createElement('div', {
    style: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: avatarSrc ? 'transparent' : 'var(--color-blue-100, #C5DFF2)',
      overflow: 'hidden',
      flexShrink: 0,
      border: '2px solid var(--color-border-subtle, #E8E6E6)'
    }
  }, avatarSrc && React.createElement('img', {
    src: avatarSrc,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), React.createElement('div', null, React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display, "Urbanist", sans-serif)',
      fontSize: '15px',
      fontWeight: '700',
      color: 'var(--color-text-primary, #1E1F1E)'
    }
  }, name), React.createElement('div', {
    style: {
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '13px',
      fontWeight: '500',
      color: 'var(--color-primary, #1C75BC)'
    }
  }, role))), bio && React.createElement('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '13px',
      color: 'var(--color-text-secondary, #454C59)',
      lineHeight: '1.6'
    }
  }, bio));
}
Object.assign(__ds_scope, { TeamCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/TeamCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  variant = 'primary',
  children
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.04em',
    borderRadius: 'var(--radius-full, 9999px)',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
    border: '1.5px solid transparent'
  };
  const variants = {
    primary: {
      background: 'var(--color-blue-50, #EBF4FB)',
      color: 'var(--color-primary, #1C75BC)',
      borderColor: 'var(--color-blue-100, #C5DFF2)'
    },
    navy: {
      background: 'var(--color-primary-dark, #2B3990)',
      color: '#fff',
      borderColor: 'var(--color-primary-dark, #2B3990)'
    },
    subtle: {
      background: 'var(--color-neutral-100, #E8E6E6)',
      color: 'var(--color-text-secondary, #454C59)',
      borderColor: 'var(--color-border-default, #D1D0CE)'
    },
    success: {
      background: '#EBF7F1',
      color: '#1A7F4B',
      borderColor: '#A3D9BC'
    },
    warning: {
      background: '#FDF5E8',
      color: '#C8821A',
      borderColor: '#F0CB8C'
    },
    error: {
      background: '#FDECEA',
      color: '#C0392B',
      borderColor: '#F0A09A'
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary, #1C75BC)',
      borderColor: 'var(--color-primary, #1C75BC)'
    }
  };
  return React.createElement('span', {
    style: {
      ...base,
      ...variants[variant]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  children
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
    fontWeight: '600',
    borderRadius: 'var(--radius-md, 8px)',
    border: '2px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    lineHeight: '1',
    opacity: disabled ? 0.5 : 1
  };
  const sizes = {
    sm: {
      fontSize: '13px',
      padding: '8px 16px',
      height: '34px'
    },
    md: {
      fontSize: '15px',
      padding: '11px 22px',
      height: '42px'
    },
    lg: {
      fontSize: '16px',
      padding: '14px 28px',
      height: '50px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--color-primary, #1C75BC)',
      color: '#fff',
      borderColor: 'var(--color-primary, #1C75BC)'
    },
    navy: {
      background: 'var(--color-primary-dark, #2B3990)',
      color: '#fff',
      borderColor: 'var(--color-primary-dark, #2B3990)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary-dark, #2B3990)',
      borderColor: 'var(--color-primary-dark, #2B3990)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-primary, #1C75BC)',
      borderColor: 'transparent'
    }
  };
  const [hovered, setHovered] = React.useState(false);
  const hoverStyles = hovered && !disabled ? {
    primary: {
      background: 'var(--color-primary-dark, #2B3990)',
      borderColor: 'var(--color-primary-dark, #2B3990)'
    },
    navy: {
      background: '#1E2A70',
      borderColor: '#1E2A70'
    },
    outline: {
      background: 'var(--color-primary-dark, #2B3990)',
      color: '#fff'
    },
    ghost: {
      background: 'var(--color-blue-50, #EBF4FB)'
    }
  }[variant] : {};
  const style = {
    ...base,
    ...sizes[size],
    ...variants[variant],
    ...hoverStyles
  };
  return React.createElement('button', {
    type,
    disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = 'left'
}) {
  const textAlign = align;
  const headingColor = light ? '#fff' : 'var(--color-primary-dark, #2B3990)';
  const eyebrowColor = light ? 'rgba(255,255,255,0.8)' : 'var(--color-primary, #1C75BC)';
  const subtitleColor = light ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary, #454C59)';
  return React.createElement('div', {
    style: {
      textAlign,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, eyebrow && React.createElement('span', {
    style: {
      display: 'block',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '0.05em',
      color: eyebrowColor
    }
  }, eyebrow), React.createElement('h2', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display, "Urbanist", sans-serif)',
      fontSize: 'clamp(28px, 4vw, 40px)',
      fontWeight: '900',
      color: headingColor,
      lineHeight: '1.2',
      letterSpacing: '-0.02em'
    }
  }, title), subtitle && React.createElement('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '16px',
      lineHeight: '1.6',
      color: subtitleColor,
      maxWidth: '560px'
    }
  }, subtitle));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/ServiceItem.jsx
try { (() => {
function ServiceItem({
  icon,
  title,
  description,
  light = false
}) {
  const titleColor = light ? '#fff' : 'var(--color-primary-dark, #2B3990)';
  const descColor = light ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary, #454C59)';
  const iconBg = light ? 'rgba(255,255,255,0.15)' : 'var(--color-blue-50, #EBF4FB)';
  const iconColor = light ? '#fff' : 'var(--color-primary, #1C75BC)';
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-start'
    }
  }, icon && React.createElement('div', {
    style: {
      width: '48px',
      height: '48px',
      background: iconBg,
      borderRadius: 'var(--radius-md, 8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: iconColor,
      fontSize: '22px'
    }
  }, icon), React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, React.createElement('h3', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display, "Urbanist", sans-serif)',
      fontSize: '16px',
      fontWeight: '700',
      color: titleColor,
      lineHeight: '1.35'
    }
  }, title), description && React.createElement('p', {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '14px',
      color: descColor,
      lineHeight: '1.55'
    }
  }, description)));
}
Object.assign(__ds_scope, { ServiceItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ServiceItem.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  disabled,
  hint
}) {
  const [focused, setFocused] = React.useState(false);
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
    fontSize: '15px',
    color: 'var(--color-text-primary, #1E1F1E)',
    background: disabled ? 'var(--color-neutral-50, #F1EDED)' : '#fff',
    border: `1.5px solid ${error ? 'var(--color-error, #C0392B)' : focused ? 'var(--color-primary, #1C75BC)' : 'var(--color-border-default, #D1D0CE)'}`,
    borderRadius: 'var(--radius-md, 8px)',
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: focused ? 'var(--shadow-focus, 0 0 0 3px rgba(28,117,188,0.2))' : 'none',
    cursor: disabled ? 'not-allowed' : 'text'
  };
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-primary, #1E1F1E)',
    marginBottom: '6px'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, label && React.createElement('label', {
    style: labelStyle
  }, label, required && React.createElement('span', {
    style: {
      color: 'var(--color-error, #C0392B)',
      marginLeft: '3px'
    }
  }, '*')), React.createElement('input', {
    type,
    placeholder,
    value,
    disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: inputStyle
  }), error && React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--color-error, #C0392B)',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)'
    }
  }, error), hint && !error && React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--color-text-muted, #8C909A)',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Navbar.jsx
try { (() => {
function Navbar({
  links = [],
  ctaLabel = 'Get Started',
  ctaHref = '#',
  logoSrc
}) {
  return React.createElement('nav', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-8, 32px)',
      height: 'var(--header-height, 72px)',
      background: '#fff',
      boxShadow: 'var(--shadow-nav, 0 1px 4px rgba(0,0,0,0.08))',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }
  }, React.createElement('a', {
    href: '/',
    style: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none'
    }
  }, logoSrc ? React.createElement('img', {
    src: logoSrc,
    alt: 'CortanaTech Solutions',
    style: {
      height: '40px',
      objectFit: 'contain'
    }
  }) : React.createElement('div', {
    style: {
      fontFamily: 'var(--font-display, "Urbanist", sans-serif)',
      fontWeight: '900',
      fontSize: '18px',
      color: 'var(--color-primary-dark, #2B3990)',
      letterSpacing: '-0.02em'
    }
  }, 'CORTANATECH')), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-8, 32px)'
    }
  }, links.length > 0 && React.createElement('ul', {
    style: {
      display: 'flex',
      gap: 'var(--space-8, 32px)',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      alignItems: 'center'
    }
  }, links.map((link, i) => React.createElement('li', {
    key: i
  }, React.createElement('a', {
    href: link.href,
    style: {
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--color-text-primary, #1E1F1E)',
      textDecoration: 'none'
    }
  }, link.label)))), React.createElement('a', {
    href: ctaHref,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      background: 'var(--color-primary-dark, #2B3990)',
      borderRadius: 'var(--radius-md, 8px)',
      padding: '9px 20px',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    }
  }, ctaLabel)));
}
Object.assign(__ds_scope, { Navbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Navbar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BlogCard = __ds_scope.BlogCard;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.TeamCard = __ds_scope.TeamCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.ServiceItem = __ds_scope.ServiceItem;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Navbar = __ds_scope.Navbar;

})();
