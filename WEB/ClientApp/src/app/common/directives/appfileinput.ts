import { Directive, HostListener, EventEmitter, Input, Output } from '@angular/core';

@Directive({
    selector: '[app-file-input]',
})
export class AppFileInputDirective /*implements ControlValueAccessor*/ {

    @Input() appFileName: string;
    @Output() appFileNameChange = new EventEmitter<string>();
    @Input() appFileContent: string;
    @Output() appFileContentChange = new EventEmitter<string>();

    @HostListener('change', ['$event.target.files']) onChange = (fileList: FileList) => {

        const reader = new FileReader();

        if (fileList && fileList.length === 1) { // doesn't handle multiple files

            this.appFileNameChange.emit(fileList[0].name);

            reader.onload = () => {
                const contents = reader.result as string;
                const regex = /data:(.*);base64,(.+)/;

                if (regex.test(contents)) {
                    const matches = regex.exec(contents);
                    this.appFileContentChange.emit(matches[2]);
                } else {
                    this.appFileContentChange.emit(undefined);
                }

            }
            reader.readAsDataURL(fileList[0]);
        } else {
            this.appFileContentChange.emit(undefined);
            this.appFileNameChange.emit(undefined);
        }
    };

}
