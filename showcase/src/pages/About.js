import React from 'react';
import '../App.css';
import '../styles/About.css'

export default function About() {

  return (
    <>
    <div className="about-container">
        <h1>About</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sollicitudin nibh sapien, at dictum orci pharetra id. Aliquam eu dignissim mauris, eget porta lacus. In non libero ac neque ornare laoreet. Sed ut lacus sit amet dui viverra laoreet ac eget nunc. Aenean risus erat, tincidunt a dui a, scelerisque aliquam enim. Nullam nibh sapien, luctus a condimentum non, egestas id felis. Donec in nunc in lectus iaculis sagittis. Vestibulum ipsum purus, pretium non imperdiet et, porttitor nec est. Sed at risus ligula. Pellentesque malesuada justo sit amet orci posuere, vel faucibus magna aliquet. Praesent sagittis facilisis massa in tempor. Fusce sodales nunc a velit feugiat, non ultrices mauris sollicitudin. Nam sed tincidunt augue.</p>

<p>Maecenas mattis nibh at mi vulputate iaculis. Pellentesque libero dui, dignissim quis placerat at, gravida ut lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse ultricies nisl et magna blandit, sed faucibus risus accumsan. Sed finibus neque augue, id consequat tellus maximus in. Sed aliquam commodo turpis id volutpat. Pellentesque vehicula vitae magna mollis ultricies. Vivamus viverra eros eget lacus feugiat dignissim. Proin non enim non ipsum ornare posuere ut sed est. Curabitur nec interdum odio.</p>
<p>Firstly, Domestic supply quantity is the sum of Production qty + Imports + Opening stock - Exports;</p>
<p>Secondly, "Food processing" is booked for food that can't be consummed in its original form such as oats. When processed, the quantity is consequently added to food or feed and written off the food processing stock to avoid duplicates;</p>


As for the relation between all 11 elements : <br/>

<p>Domestic supply quantity = Production qty + Imports + Opening stock - Exports = Closing stock + Food + Feed + Seed + Losses + Processed + Others uses + Tourist consumption + Residuals</p>

<p>Domestic supply quantity = Production qty + Imports + Opening stock - Exports = Production quantity + Imports - Exports - Stock variation = Food + Feed + Seed + Losses + Processed + Others uses + Tourist consumption + Residuals</p>
        <h2>Subtitle</h2>
        <p>This project was made during the Master course "Visualisation de l'information"</p>
        
       
    </div>
      
    </>
  );
}