import { FC, useEffect, useRef, useState } from "react"
import type { Options } from '../config/configData'
import { Icon } from './SvgIcon'

interface PlayGroundProps {
  data: Options[]
  value: string
  onChange: (data: Options) => void
}

const PlayGround: FC<PlayGroundProps> = (props) => {

  useEffect(() => {
    const current = props.data.find(item => item.value === props.value)
    setCurrent(current)
  }, [props.value, props.data])

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
      <details className="dropdown w-full mt-3" ref={dropdownRef}>
        <summary className="w-full rounded-md bg-[#f8f8f8] h-[47px] flex items-center px-4 border-solid border border-[#afafaf] cursor-pointer hover:bg-[#e6e6e6]">
          {
             current?.headType === 'icon' ? <span className="w-[22px] h-[22px] rounded-sm bg-[#bebebe] flex items-center justify-center	mr-2">{ current?.icon }</span>
              : <span className="w-[22px] h-[22px] rounded-md overflow-hidden	mr-2"><img src={current?.imageUrl} /></span>
          }
          <span>{ current?.label }</span>
        </summary>
        <ul className="dropdown-content menu p-0 shadow bg-base-100 rounded-box w-full z-10 max-h-80 overflow-auto flex-nowrap">
          {
            props.data?.map(item => (
              <li className="relative w-full" onClick={() => handleClick(item)} key={item.value}>
                <a className="py-3 bg-[#f8f8f8]">
                  {
                    item.headType === 'icon' ? <span className="w-[22px] h-[22px] rounded-sm bg-[#bebebe] flex items-center justify-center">{  item?.icon }</span>
                    : <span className="w-8 h-8 rounded-md overflow-hidden	"><img src={item.imageUrl} /></span>
                  }
                  <span className="title">{ item.label }</span>
                  { current?.value === item.value && <span><Icon name="Check" color="#0056B5" /></span> }
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