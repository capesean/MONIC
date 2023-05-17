import { FieldValue } from "./fieldvalue.model";
import { OptionValue } from "./optionvalue.model";

export interface IHasFields {
    fieldValues: FieldValue[];
    optionValues: OptionValue[];
}
