import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Logo() {
    return (<Link href={"/dashboard"}>
        <div className="flex flex-row gap-[12px]">
            <img src="/logo.png" width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="hidden sm:flex">
                <p className="text-center font-poppins">
                    <span className="text-primary font-extrabold text-3xl block">Green</span>
                    <span className="text-gray block uppercase font-medium text-xl tracking-widest">Trust</span>
                </p>
            </div>
        </div>
    </Link>);
}
