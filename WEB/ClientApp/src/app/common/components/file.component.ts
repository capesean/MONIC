import { Component, OnInit, forwardRef, Input, EventEmitter, Output, HostListener, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.css'],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileComponent),
            multi: true
        }],
    standalone: false
})
export class FileComponent implements OnInit, ControlValueAccessor {

    @Input() fileName: string;
    @Input() fileContents: string;
    @Input() fileId: string;
    @Input() enableDownload: boolean = true;
    @Input() required: boolean;
    @Input() enableClear = true;

    @Output() onDownload = new EventEmitter<string>();
    @Output() onClear = new EventEmitter<void>();
    @Output() fileContentsChange = new EventEmitter<string>();

    @ViewChild("fileInput") fileInput: ElementRef;;

    public disabled = false;

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    propagateChange = (_: any) => { };

    writeValue(val: any): void {
        this.fileName = val;
        this.fileContentsChange.emit(this.fileContents);
        this.propagateChange(val);
        //this.onTouch(val);
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(): void {
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    clear(): void {
        this.fileContents = undefined;
        this.fileName = undefined;
        this.fileInput.nativeElement.value = "";
        this.writeValue(undefined);
        this.onClear.emit();
    }

    @HostListener('change', ['$event.target.files']) onFileChange = (fileList: FileList) => {

        const reader = new FileReader();

        if (fileList) {

            if (fileList.length > 1) throw "Not implemented: file.component can only accept single files";

            reader.onload = () => {
                const contents = reader.result as string;
                const regex = /data:(.*);base64,(.+)/;

                if (regex.test(contents)) {
                    this.fileName = fileList[0].name;
                    this.fileContents = regex.exec(contents)[2];
                    this.writeValue(fileList[0].name);
                    // after changing the file, download will fetch the old file, so disable it, BUT then after save, it doesn't re-enable
                    //this.enableDownload = false;
                } else {
                    this.fileName = undefined;
                    this.fileContents = undefined;
                    this.writeValue(undefined);
                }

            }
            reader.readAsDataURL(fileList[0]);
        } else {
            this.fileName = undefined;
            this.fileContents = undefined;
            this.writeValue(undefined);
            this.fileInput.nativeElement.value = "";
        }
    };

    download(): void {
        this.onDownload.emit(this.fileId);
    }

    click(): void {
        if (this.disabled) return;
        //this.clear();
        this.fileInput.nativeElement.click();
    }
}
