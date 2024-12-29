export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'MotorHub',
  description: 'Make beautiful websites regardless of your design experience.',
  navItems: [
    {
      label: 'Inicio',
      href: '/inicio',
    },
    {
      label: 'Ventas',
      href: '/ventas',
    },
    {
      label: 'Inventario',
      href: '/inventario',
    },
    {
      label: 'Finanzas',
      href: '/finanzas',
    },
    {
      label: 'Reportes',
      href: '/reportes',
    },
  ],

  links: {
    github: 'https://github.com/nextui-org/nextui',
    twitter: 'https://twitter.com/getnextui',
    docs: 'https://nextui.org',
    discord: 'https://discord.gg/9b6yyZKmH4',
    sponsor: 'https://patreon.com/jrgarciadev',
  },
}
