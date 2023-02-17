import {
  Read,
  Write,
  Box,
  BigInt,
  BigNumber,
  JSON
} from "@polywrap/wasm-as";
import {
  serializeEthereum_Network,
  deserializeEthereum_Network,
  writeEthereum_Network,
  readEthereum_Network
} from "./serialization";
import * as Types from "../..";

export class Ethereum_Network {

  public static uri: string = "wrap://ens/ethereum.polywrap.eth";

  name: string;
  chainId: BigInt;
  ensAddress: string | null;

  static toBuffer(type: Ethereum_Network): ArrayBuffer {
    return serializeEthereum_Network(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Ethereum_Network {
    return deserializeEthereum_Network(buffer);
  }

  static write(writer: Write, type: Ethereum_Network): void {
    writeEthereum_Network(writer, type);
  }

  static read(reader: Read): Ethereum_Network {
    return readEthereum_Network(reader);
  }
}
