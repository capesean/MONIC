import { Injectable } from "@angular/core";
import Quill from "quill";
import BlotFormatter from "quill-blot-formatter";

Quill.register('modules/blotFormatter', BlotFormatter);

@Injectable({ providedIn: 'root' })
export class QuillConfig {

    constructor(
    ) {
    }

    public modules = {
        blotFormatter: {},
        'toolbar': {
            container: [
                // toggled buttons
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],

                // custom button values
                [{ 'header': 1 }, { 'header': 2 }],               
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                // superscript/subscript
                [{ 'script': 'sub' }, { 'script': 'super' }],
                // outdent/indent
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                // text direction
                [{ 'direction': 'rtl' }],                         
                // custom dropdown
                [{ 'size': ['small', false, 'large', 'huge'] }],  
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                // dropdown with defaults from theme
                [{ 'color': [] as string[] }, { 'background': [] as string[] }],          
                [{ 'font': [] as string[] }],
                [{ 'align': [] as string[] }],
                // remove formatting button
                ['clean'],                                         
                // link and image, video
                ['link', 'image', 'video']                         
            ]

        }
    }
}
