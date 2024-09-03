import React, { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container ">
      <div className="p-4">{children}</div>
    </div>
  )
}

export default Container
