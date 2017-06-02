(function($) {
  $('document').ready(function () {
    'use strict';

    Cart.init();
  });

  var Cart = {
    prefix: 'cd-',
    cardName: 'cd-cart',
    $cartTrigger: null,
    $cartContainer: null,
    $shadowLayer: null,
    $cartItems: null,
    $cartTotal: null,
    $priceList: null,

    init: function() {
      'use strict';

      this.storage = sessionStorage;
      this.total = this.prefix +  'total';
      this.currency = '&euro;';
      this.currencyString = '€';

      this.$cartTrigger = $('#cd-cart-trigger');
      this.$cartContainer = $('#cd-cart');
      this.$shadowLayer = $('#cd-shadow-layer');
      this.$cartItems = $('#cd-cart-items');
      this.$cartTotal = $('#cd-cart-total');
      this.$priceList = $('#price-list');

      this.createCart();
      this.handleAddToCart();
      // this.emptyCart();
      // this.deleteProduct();
      // this.handleCheckout();

      self = this;
      this.$cartTrigger.on('click', function() {
        event.preventDefault();
        self.toggleCart();
      });

      this.$shadowLayer.on('click', function() {
        event.preventDefault();
        self.toggleShadowLayer();
      })
    },

    createCart: function() {
      if(this.storage.getItem(this.cardName) == null) {
        var cart = {};
        cart.items = {};

        this.storage.setItem(this.cardName, this._toJSONString(cart));
        this.storage.setItem(this.total, '0');
      } else {
        var cart = this._toJSONObject(this.storage.getItem(this.cardName));
        this.renderCart(cart);
      }
    },

    renderCart: function(cart) {
      if (this.$cartContainer.length) {
        var items = cart.items;
        for(var product_id in items) {
          var item = items[product_id];
          this._renderItem(product_id, item);
        }
        this._renderTotal();
      }
    },

    toggleCart: function() {
      if (this.$cartContainer.hasClass('speed-in')) {
        this.$cartContainer.removeClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
        this.$shadowLayer.removeClass('is-visible');
      } else {
        this.$cartContainer.addClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').addClass('overflow-hidden');
        });
        this.$shadowLayer.addClass('is-visible');
      }
    },

    toggleShadowLayer: function() {
      this.$shadowLayer.removeClass('is-visible');
      // firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
      if( this.$cartContainer.hasClass('speed-in') ) {
        this.$cartContainer.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
          $('body').removeClass('overflow-hidden');
        });
      } else {
        $('body').removeClass('overflow-hidden');
        this.$cartContainer.removeClass('speed-in');
      }
    },

    handleAddToCart: function() {
      var self = this;
      self.$priceList.find('li').each(function() {
        var $item = $(this);
        $item.find('i.add-to-cart').on('click', function() {
          console.log('add click');
          var product_id = $item.data().itemId;
          var product = $item.find('.title').text(); 
          var price = parseFloat($item.find('.price').text());
          var qty = 1;
          var item = {
            product: product,
            price: price,
            qty: qty
          };
          console.log("item");
          console.log(item);

          var subTotal = qty * price;
          var total = parseFloat(self.storage.getItem(self.total)) + subTotal;
          self._addToCart(product_id, item);
          self.storage.setItem(self.total, total);

          self._renderItem(product_id, item);
        });
      });
    },

    // ---------------------------------------------------
    // Helper methods
    _toJSONObject: function(str) {
      var obj = JSON.parse(str);
      return obj;
    },

    _toJSONString: function(obj) {
      var str = JSON.stringify(obj);
      return str;
    },
    _addToCart: function(product_id, item) {
      var cart = this.storage.getItem(this.cardName);

      var cartObject = this._toJSONObject(cart);
      var cartCopy = cartObject;
      var items = cartCopy.items;
      var qty = item.qty;
      var existing_item = items[product_id];
      if (existing_item) {
        // product exists, add qty
        existing_item.qty += qty;
      } else {
        // product doesn't exist, add item to items
        delete item.id;
        items[product_id] = item;
      }

      this.storage.setItem(this.cardName, this._toJSONString(cartCopy));
    },
    _renderItem: function(product_id, item) {
      // Todo, check if item is presenting in UI
      var product = item.product;
      var priceString = item.price * item.qty + this.currencyString;
      var qtyString = item.qty + 'x ';
      var cartItem = $("<li>", {text: product, "data-item-id": product_id});
      cartItem.prepend($("<span>", {class: 'cd-qty', text: qtyString}));
      cartItem.append($("<div>", {class: 'cd-price', text: priceString}));
      cartItem.append($('<a href="#0", class="cd-item-remove cd-img-replace">Remove</a>'));
      this.$cartItems.append(cartItem);
    },
    _renderTotal: function() {
      var total_string = this.storage.getItem(this.total) + ' ' + this.currencyString;
      this.$cartTotal.find('span').text(total_string);
    }
  }
}(jQuery));
