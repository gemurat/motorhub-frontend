'use client'

import { FC } from 'react'
import { VisuallyHidden } from '@react-aria/visually-hidden'
import { SwitchProps, useSwitch } from '@nextui-org/switch'
import { useTheme } from 'next-themes'
import { useIsSSR } from '@react-aria/ssr'
import clsx from 'clsx'

import { SunFilledIcon, MoonFilledIcon } from '@/components/icons'

export interface ThemeSwitchProps {
  className?: string
  classNames?: SwitchProps['classNames']
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme } = useTheme()
  const isSSR = useIsSSR()

  const onChange = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light')
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onChange()
    }
  }

  const {
    Component: SwitchComponent,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
  } = useSwitch({
    isSelected: theme === 'dark',
    onChange,
  })

  if (isSSR) return null

  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={theme === 'dark'}
      onClick={onChange}
      onKeyDown={handleKeyDown}
      className={clsx('theme-switch', className)}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <SwitchComponent {...getBaseProps()} className={classNames?.base}>
        {isSelected ? <MoonFilledIcon /> : <SunFilledIcon />}
      </SwitchComponent>
    </div>
  )
}
