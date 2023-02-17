import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Logo() {
    return (<a href="/">
        <div className="flex flex-row gap-[12px]">
            <img src="/logo.png" width={64} height={64} />
            <div>
                <p className="text-center font-poppins">
                    <span className="text-primary font-extrabold text-3xl block">Green</span>
                    <span className="text-gray block uppercase font-medium text-xl tracking-widest">Trust</span>
                </p>
            </div>
        </div>
    </a>);
}
