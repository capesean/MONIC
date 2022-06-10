export class Role {
   value: number;
   name: string;
   label: string;
}

export class Roles {
   static Administrator: Role = { value: 0, name: 'Administrator', label: 'Administrator' };
   static List: Role[] = [Roles.Administrator];
}
