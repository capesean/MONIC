import { ItemField } from "./itemfield.model";
import { ItemOption } from "./itemoption.model";

export interface IHasFields {
    itemFields: ItemField[];
    itemOptions: ItemOption[];
}
