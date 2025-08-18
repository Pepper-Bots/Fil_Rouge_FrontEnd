// register.component.ts
onSubmit(): void {
  if (this.form.valid) {
  this.authService.registerStagiaire(this.form.value).subscribe({
    next: () => this.router.navigate(['/login']),
    error: () => this.errorMessage = 'Erreur lors de l’inscription'
  });
}
}
