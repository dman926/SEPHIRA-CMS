import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { PostService } from '../post.service';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

	loaded: boolean;
	post: Post | undefined;

	constructor(private postService: PostService, private router: Router, private sanitizer: DomSanitizer) {
		this.loaded = false;
	}

	ngOnInit(): void {
		console.log(this.router.url);
		this.postService.getPost(this.router.url).toPromise().then(post => {
			if (post && post.content) {
				post.content = this.sanitizer.bypassSecurityTrustHtml(post.content as string);
			}
			this.post = post;
			this.loaded = true;
		})
	}

}
