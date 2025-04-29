import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SellService } from '../../services/sell.service';
import { CardSubmission, SubmissionStatus } from '../../models/card-submission.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-sell-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sell-result.component.html',
  styleUrls: ['./sell-result.component.css']
})
export class SellResultComponent implements OnInit {
  submission: CardSubmission | undefined;
  isLoading = true;
  error = false;
  offerAccepted = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sellService: SellService,
    private productService: ProductService
  ) {}
  
  ngOnInit(): void {
    this.getSubmission();
  }
  
  getSubmission(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.router.navigate(['/sell']);
      return;
    }
    
    this.sellService.getSubmission(id).subscribe({
      next: (submission) => {
        this.submission = submission;
        this.isLoading = false;
        
        if (!submission) {
          this.error = true;
          setTimeout(() => {
            this.router.navigate(['/sell']);
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Failed to load submission', err);
        this.isLoading = false;
        this.error = true;
      }
    });
  }
  
  acceptOffer(): void {
    if (!this.submission || !this.submission.id) {
      console.error('Cannot accept offer: submission is undefined or has no ID');
      return;
    }
    
    console.log('Accepting offer for submission:', this.submission.id, this.submission.name);
    this.isLoading = true;
    
    // Add a small delay to allow UI to update before processing
    setTimeout(() => {
      this.sellService.acceptOffer(this.submission!.id!).subscribe({
        next: (success) => {
          console.log('Offer acceptance result:', success);
          this.isLoading = false;
          
          if (success) {
            this.offerAccepted = true;
            
            // Update the submission status locally
            if (this.submission) {
              this.submission.status = SubmissionStatus.APPROVED;
            }
          } else {
            console.error('Failed to accept offer - returned false');
            alert('Sorry, there was a problem accepting your offer. Please try again later.');
          }
        },
        error: (err) => {
          console.error('Error accepting offer:', err);
          this.isLoading = false;
          alert('Sorry, there was an error processing your offer. Please try again later.');
        }
      });
    }, 10);
  }
  
  getConditionClass(): string {
    if (!this.submission) return '';
    
    switch (this.submission.condition) {
      case 'Mint':
      case 'Near Mint':
        return 'condition-excellent';
      case 'Excellent':
      case 'Good':
        return 'condition-good';
      case 'Light Played':
      case 'Played':
        return 'condition-average';
      case 'Poor':
        return 'condition-poor';
      default:
        return '';
    }
  }
  
  getRarityClass(): string {
    if (!this.submission) return '';
    
    switch (this.submission.rarity) {
      case 'Common':
        return 'rarity-common';
      case 'Uncommon':
        return 'rarity-uncommon';
      case 'Rare':
        return 'rarity-rare';
      case 'Mythic Rare':
        return 'rarity-mythic';
      case 'Special':
        return 'rarity-special';
      default:
        return '';
    }
  }
  
  goToSellForm(): void {
    this.router.navigate(['/sell']);
  }
  
  goToProductList(): void {
    this.router.navigate(['/products']);
  }
} 