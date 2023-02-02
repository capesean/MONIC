import { Component, Inject, OnInit } from '@angular/core';
import { Options } from '@popperjs/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    // todo: remove this
    public rootPath = "https://d33wubrfki0l68.cloudfront.net/053f2dfd0df2f52c41e903a21d177b0b44abc9b1/1282c";

    popperOptions = (options: Partial<Options>) => {
        options.modifiers.push({
            name: 'offset',
            options: {
                offset: [0, 20],
            },
        });
        return options;
    };

    constructor(
        private offcanvasService: NgbOffcanvas,
        private toastr: ToastrService,
        private router: Router,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {        
    }

    public offCanvas(content: any, position: 'start' | 'end' | 'top' | 'bottom' = 'start') {
        this.offcanvasService.open(content, { position: position });
    }

    logout() {
        this.authService.logout();
        this.toastr.success("You have been logged out successfully", "Log Out");
        this.router.navigate(["/auth/login"]);
    }

}
