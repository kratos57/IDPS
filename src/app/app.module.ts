import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    // HttpClientModule is not needed in standalone components setup
  ],
  providers: [],
  bootstrap: []  // Leave empty since you're using `bootstrapApplication`
})
export class AppModule { }

