import { Component, OnInit } from '@angular/core';
import { Guest } from './models';
import { ApiService } from './api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  data:Guest[] = [];
  form:FormGroup;
  constructor(private ApiSvc:ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.CreateForm()
    this.ApiSvc.getData()
    .then (results => {
      this.data = results.map<Guest>(d => {
        return {
          name: d.name,
          email: d.email,
          phone: d.phone,
          status: d.status
        } as Guest
      })
    })
  }

  submitForm(f) {
    this.form.reset();
  }

  private CreateForm () {
    this.form = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required]),
      phone: this.fb.control('', [Validators.required]),
      status: this.fb.control('', [Validators.required]),
      createdBy: this.fb.control('', [Validators.required]),
    })
  }
}
