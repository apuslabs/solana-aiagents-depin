import { FC, useEffect, useRef, useState } from "react"
import type { Options } from '../config/configData'

interface PlayGroundProps {
  data: Options[]
  value: string
  discribe?: string
  onChange: (data: Options) => void
}

const PlayGround: FC<PlayGroundProps> = (props) => {

  useEffect(() => {
    const current = props.data.find(item => item.value === props.value)
    setCurrent(current)
  }, [props.value])

  const dropdownRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as any)) {
        dropdownRef.current.open = false
      }
    }
    // 添加全局点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);

    // 清理函数：在组件卸载时移除事件监听器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef])

  const [current, setCurrent] = useState<Options>()

  const handleClick = (itemData: Options) => {
    setCurrent(itemData)
    props?.onChange(itemData)
    if (dropdownRef.current) dropdownRef.current.open = false
  }

  return (
    <div>
      <details className="dropdown mt-3" ref={dropdownRef}>
        <summary className="min-w-48 rounded-full h-[47px] flex items-center px-4 border-solid border border-[#afafaf] cursor-pointer hover:bg-[#e6e6e6] justify-center	active:bg-[#cbecf7]">
          <span>{props.discribe}:{ current?.label }</span>
        </summary>
        <ul className="dropdown-content menu p-0 shadow bg-base-100 rounded-box z-10 w-full max-h-80 overflow-auto flex-nowrap border border-[#d2d2d2]">
          <div className="p-4 pb-0">{ props.discribe }</div>
          {
            props.data?.map(item => (
              <li className="relative w-full" onClick={() => handleClick(item)} key={item.value}>
                <a className="py-3">
                  <input type="radio" name="radio" className="radio radio-primary" checked={item?.value === current?.value} onChange={() => {}} />
                  <span className="title">{ item.label }</span>
                </a>
              </li>
            ))
          }
        </ul>
      </details>
    </div>
  )
}

export default PlayGround