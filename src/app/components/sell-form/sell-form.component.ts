import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SellService } from '../../services/sell.service';
import { CardSubmission, SubmissionStatus } from '../../models/card-submission.model';

@Component({
  selector: 'app-sell-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sell-form.component.html',
  styleUrls: ['./sell-form.component.css']
})
export class SellFormComponent implements OnInit {
  cardName: string = '';
  cardDescription: string = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isSubmitting: boolean = false;
  submissionError: string | null = null;
  
  constructor(
    private sellService: SellService,
    private router: Router
  ) {}
  
  ngOnInit(): void {}
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.createImagePreview();
    }
  }
  
  createImagePreview(): void {
    if (!this.selectedFile) {
      this.imagePreviewUrl = null;
      return;
    }
    
    // Check if the file is an image
    if (!this.selectedFile.type.match(/image.*/)) {
      this.submissionError = 'Please select an image file';
      this.selectedFile = null;
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    
    reader.readAsDataURL(this.selectedFile);
  }
  
  onSubmit(): void {
    if (!this.imagePreviewUrl) {
      this.submissionError = 'Please upload an image of your card';
      return;
    }
    
    if (!this.cardName.trim()) {
      this.submissionError = 'Please enter a card name';
      return;
    }
    
    this.isSubmitting = true;
    this.submissionError = null;
    
    const submission: Partial<CardSubmission> = {
      name: this.cardName,
      description: this.cardDescription,
      imageUrl: this.imagePreviewUrl,
      status: SubmissionStatus.PENDING
    };
    
    this.sellService.submitCard(submission).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.router.navigate(['/sell/result', result.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submissionError = 'Failed to submit card. Please try again.';
        console.error('Submission error:', err);
      }
    });
  }
  
  resetForm(): void {
    this.cardName = '';
    this.cardDescription = '';
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.submissionError = null;
  }
} 