  function filterProducts() {
    const selectedCategory = document.getElementById('category-select').value;
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (selectedCategory === 'all' || category === selectedCategory) {
        card.style.display = 'block'; // Show product
      } else {
        card.style.display = 'none'; // Hide product
      }
    });
  }

