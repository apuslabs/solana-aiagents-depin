import { FC, useState } from "react";
import DropRadio from '../../components/DropRadio'
import { dateList } from '../../config/configData'
import type { Options } from '../../config/configData'

const PlayGround: FC = () => {
  const [date, setDate] = useState<string>('30')

  const handleFilterChange = (data: Options) => {
    setDate(data.value)
  }


  return (
    <>
      <div className="flex items-center justify-center">
        <div className="w-[265px] h-[65px] bg-base-100 rounded-xl border border-border-base text-3xl text-center leading-[65px]">AI Tasks</div>
      </div>
      <div className="bg-base-100 w-full min-h-[600px] mt-4 p-5">
        <div className="text-xl">Filter by</div>
        <DropRadio data={dateList} value={date} onChange={handleFilterChange} discribe="Date" />
        <div className="text-xl mt-6">Completed Tasks</div>
        <ul className="mt-4">
          <li>
            <div className="text-[#565D65] mb-3">2 weeks ago</div>
            <div className="w-full p-4 pt-6 border border-border-base flex items-top">
              <div className="w-[86px] h-[86px] bg-gray-100"></div>
              <div className="ml-8">
                <div className="text-lg leading-4 font-bold">AI Agent: SDXL 1.1</div>
                <div className="leading-6 mt-2">Mar 2</div>
                <div className="leading-6">GPU Node ID: 0xa8123074</div>
                <div className="leading-6">GPU Node IP: https://3.176.65.44:9876</div>
                <div className="text-[#356DCC] underline cursor-pointer">tx: fsbu6qw83nv65a1</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  )
}

export default PlayGround