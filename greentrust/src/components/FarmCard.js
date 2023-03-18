import Info from "@/components/Info";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import { truncate } from "@/utils";
import Skeleton from "@mui/material/Skeleton";
import { useState } from "react";

const FarmCard = ({ farm }) => {
  let documents = JSON.parse(farm.documents);

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/farm/${farm.id}`} >
      <div className="w-full !max-w-[280px] bg-white rounded-xl shadow-lg overflow-clip hover:scale-[101%] aspect-[350/409] mr-8">
        <div className="h-[70%]">
          <Image
            className={`object-cover !h-full !w-full ${!imageLoaded ? "hidden" : ""}`}
            src={documents.farmImage == null ?"images/farm.png" : "https://ipfs.io/ipfs/" + documents.farmImage}
            alt="avatar"
            width={0}
            height={0}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <Skeleton variant="rectangular" width="1024px" height="100%" />}
        </div>
        <div className="flex flex-col justify-center items-center h-[30%]">
          <div className="w-full" title={farm.name}>
            <p className="font-darkGray text-lg font-bold whitespace-nowrap text-ellipsis overflow-hidden text-center">
              {truncate(farm.name, 16)}
            </p>
          </div>
          <Info icon={faLocationDot} text={truncate(farm.location, 20)} style="text-red" />
        </div>
      </div>
    </Link>
  );
};

export default FarmCard;