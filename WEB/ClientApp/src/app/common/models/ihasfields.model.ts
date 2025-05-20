import { FieldValue } from "./fieldvalue.model";
import { ItemOption } from "./itemoption.model";

export interface IHasFields {
    fieldValues: FieldValue[];
    itemOptions: ItemOption[];
}
