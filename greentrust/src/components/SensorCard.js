import { faHashtag, faChartLine } from "@fortawesome/free-solid-svg-icons";

import Info from "@/components/Info";


export default function SensorCard({ details, ...props }) {
  return (
    <div className="flex flex-col gap-2.5 py-6 px-5 shadow-lg rounded-2xl w-full cursor-pointer hover:scale-105" {...props}>
      <Info icon={faChartLine} text={details.name} style="!w-[32px] !h-[32px]" textStyle="font-semibold text-xl" />
      <Info icon={faHashtag} text={details.id} style="text-gray !w-[18px] !h-[18px]" iconDivStyle="w-[32px]" textStyle="!text-gray font-bold" />
    </div>
  );
}
