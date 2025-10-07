import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 2rem 0;
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  background-color: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  background-color: #f8f9fa;
  padding: 3rem 2rem;
  border-radius: 10px;
  margin-bottom: 3rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
`;

const StatItem = styled.div`
  h3 {
    font-size: 2.5rem;
    color: #667eea;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-weight: 500;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>ShopMall에 오신 것을 환영합니다</HeroTitle>
        <HeroSubtitle>
          최고의 품질과 합리적인 가격으로 만나는 온라인 쇼핑의 새로운 경험
        </HeroSubtitle>
        <CTAButton>지금 쇼핑하기</CTAButton>
      </Hero>

      <FeaturesSection>
        <SectionTitle>왜 ShopMall을 선택해야 할까요?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🚚</FeatureIcon>
            <FeatureTitle>빠른 배송</FeatureTitle>
            <FeatureDescription>
              전국 어디든 24시간 내 배송! 급하게 필요한 상품도 걱정 없어요.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>💎</FeatureIcon>
            <FeatureTitle>프리미엄 품질</FeatureTitle>
            <FeatureDescription>
              엄선된 브랜드와 검증된 품질의 상품만을 제공합니다.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>안전한 결제</FeatureTitle>
            <FeatureDescription>
              최신 보안 시스템으로 안전하고 편리한 결제 환경을 제공합니다.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureTitle>맞춤 추천</FeatureTitle>
            <FeatureDescription>
              AI 기반 개인화 추천으로 당신만을 위한 상품을 찾아드립니다.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <StatsSection>
        <SectionTitle>ShopMall의 성과</SectionTitle>
        <StatsGrid>
          <StatItem>
            <h3>100K+</h3>
            <p>만족한 고객</p>
          </StatItem>
          <StatItem>
            <h3>50K+</h3>
            <p>등록된 상품</p>
          </StatItem>
          <StatItem>
            <h3>99.9%</h3>
            <p>서비스 가동률</p>
          </StatItem>
          <StatItem>
            <h3>24/7</h3>
            <p>고객 지원</p>
          </StatItem>
        </StatsGrid>
      </StatsSection>
    </HomeContainer>
  );
};

export default Home;