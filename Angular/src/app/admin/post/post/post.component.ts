import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

	private id: string | undefined;
	private postType: string | undefined;
	private paramsSub: Subscription | undefined;
	private parentParamsSub: Subscription | undefined;

	constructor(private router: Router, private route: ActivatedRoute, private platform: PlatformService, private admin: AdminService) { }

	ngOnInit(): void {
		if (this.platform.isBrowser()) {
			this.parentParamsSub = this.route.parent!.params.subscribe(params => {
				this.postType = params.postType;
				if (!this.postType) {
					this.router.navigate(['../'], {relativeTo: this.route});
				}
				this.admin.getPostSchema(this.postType!).toPromise().then(schema => {
					console.log(schema);
				});
				this.paramsSub = this.route.params.subscribe(params => {
					this.id = params.id;
					if (!this.id) {
						this.router.navigate(['../'], {relativeTo: this.route});
					}
					this.admin.getPost(this.postType!, this.id!).toPromise().then(post => {
						console.log(post);
					});
				});
			});
		}	
	}

	ngOnDestroy(): void {
		this.paramsSub?.unsubscribe();
		this.parentParamsSub?.unsubscribe();
	}

}
