export class Enum {
    value: number;
    name: string;
    label: string;
}

export enum Roles {
    Administrator
}

export class Enums {

    static Roles: Enum[] = [
        { value: 0, name: 'Administrator', label: 'Administrator' }
    ]

}

